
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { FractionVisualProps, ShadingSegment } from '../types';
import {
  BORDER_COLOR,
  GRID_LINE_COLOR,
  CELL_NUMBER_FONT_SIZE,
  FRACTION1_COLOR,
  FRACTION1_TEXT_COLOR,
  FRACTION2_COLOR,
  FRACTION2_TEXT_COLOR,
  TEXT_COLOR_DARK
} from '../constants';

const ANIMATION_DURATION = 1000; // Animation duration in ms

// Define CellMeta directly in this file if it's only used here or for clarity
type CellMeta = { 
  x: number; y: number; // Top-left of cell relative to mainGroup's centered origin
  colIdx: number; rowIdx: number; 
  logicalCellIdx: number; // This is always (rowIdx * logicalCols + colIdx)
};

const FractionVisual: React.FC<FractionVisualProps> = ({
  idSuffix,
  baseWidth,
  baseHeight,
  cols: logicalCols,
  rows: logicalRows,
  shadingSegments,
  isColumnBasedShading = false,
  showCellNumbers = true,
  rotationAngle = 0,
  numberingOrder = 'ltr-ttb',
  cellNumberingDenominator,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const prevRotationAngleRef = useRef<number>(rotationAngle);
  const initialRenderRef = useRef<boolean>(true);

  useEffect(() => {
    if (!svgRef.current || logicalCols <= 0 || logicalRows <= 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    const DIAGONAL = Math.hypot(baseWidth, baseHeight);

    svg.attr('width', DIAGONAL)
       .attr('height', DIAGONAL)
       .attr('viewBox', `0 0 ${DIAGONAL} ${DIAGONAL}`)
       .style('overflow', 'visible'); 

    const canvasGroup = svg.append("g")
      .attr("id", `canvas-group-${idSuffix}`)
      .attr("transform", `translate(${DIAGONAL / 2}, ${DIAGONAL / 2})`);

    const mainGroup = canvasGroup.append("g").attr("id", `fraction-group-${idSuffix}`);
    
    const actualCellWidth = baseWidth / logicalCols;
    const actualCellHeight = baseHeight / logicalRows;

    const fromAngle = initialRenderRef.current ? rotationAngle : prevRotationAngleRef.current;
    
    mainGroup.attr("transform", `rotate(${fromAngle}, 0, 0)`);

    if (fromAngle !== rotationAngle && !initialRenderRef.current) {
      mainGroup.transition()
        .duration(ANIMATION_DURATION)
        .ease(d3.easeLinear)
        .attr("transform", `rotate(${rotationAngle}, 0, 0)`);
    }

    mainGroup.append("rect")
      .attr("x", -baseWidth / 2)
      .attr("y", -baseHeight / 2)
      .attr("width", baseWidth)
      .attr("height", baseHeight)
      .attr("fill", "none")
      .attr("stroke", BORDER_COLOR)
      .attr("stroke-width", 2);

    const cellData: Array<CellMeta> = [];
    const gridTopLeftX = -baseWidth / 2;
    const gridTopLeftY = -baseHeight / 2;

    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        cellData.push({
          x: gridTopLeftX + c * actualCellWidth,
          y: gridTopLeftY + r * actualCellHeight,
          colIdx: c, 
          rowIdx: r, 
          logicalCellIdx: r * logicalCols + c, 
        });
      }
    }
    
    const determineCellFill = (
      dataCell: CellMeta,
      segments: ShadingSegment[],
    ): string => {
      if (!segments || segments.length === 0) return "transparent";
      
      if (isColumnBasedShading) {
        // This logic assumes segment.count refers to the number of full columns (or rows if rotated)
        // to shade from the 'start' of the grid.
        const segment = segments[0]; // Typically one segment for this mode
        const colsToShade = segment.count; 
        // This is comparing against logical column index, before any rotation.
        if (dataCell.colIdx < colsToShade) { 
          return segment.color;
        }
      } else { // Sequential shading based on cell order defined by `numberingOrder`
        let cumulativeShadedCells = 0;
        let currentCellOrderIndex: number;

        if (numberingOrder === 'ttb-ltr') {
          // Order: (0,0), (1,0)...(R-1,0), then (0,1), (1,1)...(R-1,1), ...
          currentCellOrderIndex = dataCell.colIdx * logicalRows + dataCell.rowIdx;
        } else { // Default 'ltr-ttb'
          // Order: (0,0), (0,1)...(0,C-1), then (1,0), (1,1)...(1,C-1), ...
          // dataCell.logicalCellIdx is already r * C + c
          currentCellOrderIndex = dataCell.logicalCellIdx;
        }
        
        for (const segment of segments) {
          if (currentCellOrderIndex >= cumulativeShadedCells && currentCellOrderIndex < cumulativeShadedCells + segment.count) {
            return segment.color;
          }
          cumulativeShadedCells += segment.count;
        }
      }
      return "transparent";
    };

    mainGroup.selectAll(`.cell-${idSuffix}`)
      .data(cellData, (d) => `cell-${idSuffix}-r${(d as CellMeta).rowIdx}-c${(d as CellMeta).colIdx}`)
      .join("rect")
      .attr("class", `cell-${idSuffix}`)
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", actualCellWidth)
      .attr("height", actualCellHeight)
      .attr("stroke", GRID_LINE_COLOR)
      .attr("stroke-width", 0.5)
      .attr("fill", d => determineCellFill(d, shadingSegments));

    if (logicalCols > 1) {
      mainGroup.selectAll(`.vline-${idSuffix}`)
        .data(d3.range(1, logicalCols))
        .join("line")
        .attr("class", `vline-${idSuffix}`)
        .attr("x1", d => gridTopLeftX + d * actualCellWidth)
        .attr("x2", d => gridTopLeftX + d * actualCellWidth)
        .attr("y1", gridTopLeftY)
        .attr("y2", gridTopLeftY + baseHeight)
        .attr("stroke", BORDER_COLOR) 
        .attr("stroke-width", 1);
    }

    if (logicalRows > 1) {
      mainGroup.selectAll(`.hline-${idSuffix}`)
        .data(d3.range(1, logicalRows))
        .join("line")
        .attr("class", `hline-${idSuffix}`)
        .attr("x1", gridTopLeftX)
        .attr("x2", gridTopLeftX + baseWidth)
        .attr("y1", d => gridTopLeftY + d * actualCellHeight)
        .attr("y2", d => gridTopLeftY + d * actualCellHeight)
        .attr("stroke", BORDER_COLOR) 
        .attr("stroke-width", 1);
    }

    if (showCellNumbers) {
      const textWrapperGroups = mainGroup.selectAll(`.text-wrapper-${idSuffix}`)
        .data(cellData, (d) => `text-wrapper-${idSuffix}-r${(d as CellMeta).rowIdx}-c${(d as CellMeta).colIdx}`)
        .join("g")
        .attr("class", `text-wrapper-${idSuffix}`)
        .style("pointer-events", "none"); 

      textWrapperGroups.attr("transform", d => {
        const cellCenterX = d.x + actualCellWidth / 2;
        const cellCenterY = d.y + actualCellHeight / 2;
        return `translate(${cellCenterX}, ${cellCenterY}) rotate(${-fromAngle}, 0, 0)`;
      });
      
      if (fromAngle !== rotationAngle && !initialRenderRef.current) {
        textWrapperGroups.transition()
          .duration(ANIMATION_DURATION)
          .ease(d3.easeLinear)
          .attr("transform", d => {
            const cellCenterX = d.x + actualCellWidth / 2;
            const cellCenterY = d.y + actualCellHeight / 2;
            return `translate(${cellCenterX}, ${cellCenterY}) rotate(${-rotationAngle}, 0, 0)`;
          });
      }

      textWrapperGroups.each(function(d) { 
          const wrapper = d3.select(this);
          if (wrapper.select("text").empty()) { 
              wrapper.append("text")
                  .attr("x", 0) 
                  .attr("y", 0) 
                  .attr("text-anchor", "middle")
                  .attr("dominant-baseline", "middle")
                  .style("font-size", CELL_NUMBER_FONT_SIZE)
                  .text(() => {
                      let cellDisplayNumber: number;
                      // This numberingOrder is for TEXT display, distinct from shading order
                      if (numberingOrder === 'ttb-ltr') {
                          cellDisplayNumber = d.colIdx * logicalRows + d.rowIdx + 1;
                      } else { // 'ltr-ttb'
                          cellDisplayNumber = d.rowIdx * logicalCols + d.colIdx + 1;
                      }
                      if (cellNumberingDenominator && cellNumberingDenominator > 0) {
                          return `${cellDisplayNumber}/${cellNumberingDenominator}`;
                      }
                      return cellDisplayNumber.toString();
                  })
                  .attr("fill", () => {
                      const bgColor = determineCellFill(d, shadingSegments);
                      if (bgColor === FRACTION1_COLOR) return FRACTION1_TEXT_COLOR;
                      if (bgColor === FRACTION2_COLOR) return FRACTION2_TEXT_COLOR;
                      return TEXT_COLOR_DARK;
                  });
          }
      });
    }
    
    prevRotationAngleRef.current = rotationAngle;
    initialRenderRef.current = false;

  }, [
    idSuffix, baseWidth, baseHeight, logicalCols, logicalRows, shadingSegments, 
    isColumnBasedShading, showCellNumbers, rotationAngle, numberingOrder, cellNumberingDenominator
  ]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default FractionVisual;
