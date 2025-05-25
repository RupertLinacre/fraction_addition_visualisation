
import React, { useState } from 'react';
import FractionVisual from './FractionVisual';
import type { CalculationData, ShadingSegment, FractionVisualProps } from '../types';
import { SQUARE_SIDE, FRACTION1_COLOR, FRACTION2_COLOR, SUM_PRIMARY_COLOR, SUM_SECONDARY_COLOR, TEXT_COLOR_DARK, BORDER_COLOR } from '../constants';
import KatexDisplay from './KatexDisplay';

const DIAGONAL_SIDE = Math.hypot(SQUARE_SIDE, SQUARE_SIDE);

const OperatorDisplay: React.FC<{ symbol: string }> = ({ symbol }) => (
  <div className={`flex items-center justify-center px-1 sm:px-2`} style={{ height: `${DIAGONAL_SIDE}px` }}>
    <KatexDisplay latex={symbol} className={`text-3xl sm:text-5xl font-bold text-[${TEXT_COLOR_DARK}]`} />
  </div>
);

const RotateButton: React.FC<{ onClick: () => void; isRotated: boolean }> = ({ onClick, isRotated }) => (
  <button
    onClick={onClick}
    className={`mt-1 px-3 py-1.5 text-xs font-medium rounded-md shadow-sm
                border border-[${BORDER_COLOR}] text-[${TEXT_COLOR_DARK}] hover:bg-gray-100
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
    aria-label={isRotated ? "Rotate back to original orientation" : "Rotate 90 degrees clockwise"}
  >
    {isRotated ? 'Rotate Back' : 'Rotate 90°'}
  </button>
);

// Helper to create LaTeX string for a simple fraction
const fracToLatex = (num: number | string, den: number | string) => `\\frac{${num}}{${den}}`;

// Fixed size container style for the SVG
const visualFixedSizeContainerStyle: React.CSSProperties = {
  width: DIAGONAL_SIDE,
  height: DIAGONAL_SIDE,
};
const visualFixedSizeContainerClasses = "flex items-center justify-center";

interface VisualUnitProps {
  topLabelLatex?: string;
  visualProps: Omit<FractionVisualProps, 'baseWidth' | 'baseHeight'> & Partial<Pick<FractionVisualProps, 'baseWidth' | 'baseHeight'>>;
  onRotate?: () => void;
  isRotated?: boolean;
  bottomLabelLatex?: string;
  isPlaceholder?: boolean;
}

const VisualUnit: React.FC<VisualUnitProps> = ({
  topLabelLatex,
  visualProps,
  onRotate,
  isRotated,
  bottomLabelLatex,
  isPlaceholder = false,
}) => {
  const unitVisibilityStyle: React.CSSProperties['visibility'] = isPlaceholder ? 'hidden' : 'visible';

  const fixedLabelHeight = '4rem';
  const fixedRotateButtonSlotHeight = '2.5rem';

  return (
    <div
      className="flex flex-col items-center space-y-1"
      style={{ minWidth: `${DIAGONAL_SIDE}px`, visibility: unitVisibilityStyle }}
      aria-hidden={isPlaceholder}
    >
      <div
        className={`text-center text-base sm:text-lg font-semibold text-[${TEXT_COLOR_DARK}] flex items-center justify-center w-full`}
        style={{ height: fixedLabelHeight }}
      >
        {topLabelLatex && <KatexDisplay latex={topLabelLatex} />}
      </div>

      <div className={visualFixedSizeContainerClasses} style={visualFixedSizeContainerStyle}>
        {!isPlaceholder && (
          <FractionVisual
            {...visualProps}
            baseWidth={visualProps.baseWidth ?? SQUARE_SIDE}
            baseHeight={visualProps.baseHeight ?? SQUARE_SIDE}
          />
        )}
      </div>

      <div
        className="flex items-center justify-center w-full"
        style={{ height: fixedRotateButtonSlotHeight }}
      >
        {onRotate && typeof isRotated !== 'undefined' && !isPlaceholder && (
          <RotateButton onClick={onRotate} isRotated={isRotated} />
        )}
      </div>

      <div
        className={`text-center text-base sm:text-lg font-semibold text-[${TEXT_COLOR_DARK}] flex items-center justify-center w-full`}
        style={{ height: fixedLabelHeight }}
      >
        {bottomLabelLatex && <KatexDisplay latex={bottomLabelLatex} />}
      </div>
    </div>
  );
};

interface VisualizationSectionProps {
  calcData: CalculationData | null;
}

export const VisualizationSection: React.FC<VisualizationSectionProps> = ({ calcData }) => {
  const [rotationF1, setRotationF1] = useState<0 | 90>(0);
  const [rotationF2, setRotationF2] = useState<0 | 90>(0);

  if (!calcData || calcData.isError) {
    return null;
  }

  const { f1, f2, commonDenominator, f1TransformedNum, f2TransformedNum, sumNum } = calcData;

  const f1aVisualProps: VisualUnitProps['visualProps'] = {
    idSuffix: "f1a",
    cols: f1.den, rows: 1,
    shadingSegments: [{ count: f1.num, color: FRACTION1_COLOR, id: "f1init" }],
    isColumnBasedShading: true, showCellNumbers: true, rotationAngle: 0,
    numberingOrder: 'ltr-ttb', cellNumberingDenominator: f1.den,
  };
  const f2aVisualProps: VisualUnitProps['visualProps'] = {
    idSuffix: "f2a",
    cols: f2.den, rows: 1,
    shadingSegments: [{ count: f2.num, color: FRACTION2_COLOR, id: "f2init" }],
    isColumnBasedShading: true, showCellNumbers: true, rotationAngle: 0,
    numberingOrder: 'ltr-ttb', cellNumberingDenominator: f2.den,
  };

  const f1bVisualProps: VisualUnitProps['visualProps'] = {
    idSuffix: "f1b",
    cols: f1.den, rows: f2.den,
    shadingSegments: [{ count: f1.num, color: FRACTION1_COLOR, id: "f1transformed" }],
    isColumnBasedShading: true, showCellNumbers: true, rotationAngle: rotationF1,
    numberingOrder: 'ltr-ttb', cellNumberingDenominator: commonDenominator,
  };
  const f2bVisualProps: VisualUnitProps['visualProps'] = {
    idSuffix: "f2b",
    cols: f2.den, rows: f1.den,
    shadingSegments: [{ count: f2.num, color: FRACTION2_COLOR, id: "f2transformed" }],
    isColumnBasedShading: true, showCellNumbers: true, rotationAngle: rotationF2,
    numberingOrder: 'ltr-ttb', cellNumberingDenominator: commonDenominator,
  };

  const sumVisualProps: VisualUnitProps['visualProps'] = {
    idSuffix: "sum",
    cols: f1.den, rows: f2.den, // Grid dimensions for sum
    shadingSegments: [
      { count: f1TransformedNum, color: SUM_PRIMARY_COLOR, id: "sumPart1" },
      { count: f2TransformedNum, color: SUM_SECONDARY_COLOR, id: "sumPart2" }
    ],
    isColumnBasedShading: false, // Sequential shading of cells
    showCellNumbers: true,
    rotationAngle: 0, // Sum visual is not rotated
    numberingOrder: 'ttb-ltr', // Fill top-to-bottom, then left-to-right
    cellNumberingDenominator: commonDenominator,
  };

  return (
    <div className="max-w-fit mx-auto mt-8 p-1 sm:p-3 bg-white rounded-xl shadow-xl">
      <h2 className={`text-2xl font-semibold text-center mb-6 text-[${TEXT_COLOR_DARK}]`}>Visualization</h2>

      <div className="flex flex-col items-center space-y-2 sm:space-y-4">
        {/* Top Row of Visuals - Initial Fractions */}
        <div className="flex flex-row items-center justify-center w-auto gap-x-4 sm:gap-x-8">
          <VisualUnit
            topLabelLatex={fracToLatex(f1.num, f1.den)}
            visualProps={f1aVisualProps}
          />
          <OperatorDisplay symbol="+" />
          <VisualUnit
            topLabelLatex={fracToLatex(f2.num, f2.den)}
            visualProps={f2aVisualProps}
          />
          <OperatorDisplay symbol="=" />
          <VisualUnit isPlaceholder={true} visualProps={{ idSuffix: "sumplaceholder-top", cols: 1, rows: 1, shadingSegments: [] }} />
        </div>

        {/* Bottom Row of Visuals - Transformed Fractions and Sum */}
        <div className="flex flex-row items-center justify-center w-auto gap-x-4 sm:gap-x-8">
          <VisualUnit
            topLabelLatex={`\\frac{${f1.num} \\times ${f2.den}}{${f1.den} \\times ${f2.den}} = ${fracToLatex(f1TransformedNum, commonDenominator)}`}
            visualProps={f1bVisualProps}
            onRotate={() => setRotationF1(prev => (prev === 0 ? 90 : 0))}
            isRotated={rotationF1 === 90}
          />
          <OperatorDisplay symbol="+" />
          <VisualUnit
            topLabelLatex={`\\frac{${f2.num} \\times ${f1.den}}{${f2.den} \\times ${f1.den}} = ${fracToLatex(f2TransformedNum, commonDenominator)}`}
            visualProps={f2bVisualProps}
            onRotate={() => setRotationF2(prev => (prev === 0 ? 90 : 0))}
            isRotated={rotationF2 === 90}
          />
          <OperatorDisplay symbol="=" />
          <VisualUnit
            topLabelLatex={fracToLatex(sumNum, commonDenominator)}
            visualProps={sumVisualProps}
          />
        </div>
      </div>
    </div>
  );
};
