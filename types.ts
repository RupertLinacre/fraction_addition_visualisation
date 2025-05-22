export interface FractionInput {
  num: string;
  den: string;
}

export interface ValidatedFraction {
  num: number;
  den: number;
}

export interface CalculationData {
  f1: ValidatedFraction;
  f2: ValidatedFraction;
  commonDenominator: number;
  f1TransformedNum: number; // a*y
  f1TransformedDen: number; // b*y
  f2TransformedNum: number; // x*b
  f2TransformedDen: number; // y*b (same as b*y)
  sumNum: number;
  sumDen: number; // b*y
  isError: boolean;
  errorMessage?: string;
}

export interface ShadingSegment {
  count: number; // For column-based: number of columns. For sequential: number of cells.
  color: string;
  id: string; // for d3 key
  label?: string; // Optional label for the segment for debugging or future use
}

export interface FractionVisualProps {
  idSuffix: string;
  baseWidth: number; // Will be SQUARE_SIDE
  baseHeight: number; // Will be SQUARE_SIDE
  cols: number; // Logical columns of the underlying grid structure
  rows: number; // Logical rows of the underlying grid structure
  shadingSegments: ShadingSegment[];
  isColumnBasedShading?: boolean; // If true, segment.count refers to columns to shade. Else, sequential cells.
  showCellNumbers?: boolean; // If true, numbers cells ordinally
  rotationAngle?: 0 | 90; // Rotation angle for the grid
  numberingOrder?: 'ltr-ttb' | 'ttb-ltr'; //ltr-ttb: left-to-right, then top-to-bottom. ttb-ltr: top-to-bottom, then left-to-right.
  cellNumberingDenominator?: number; // Denominator for fractional cell numbering (e.g., N in X/N)
}

// Inform TypeScript about the katex library loaded globally via CDN/importmap
declare global {
  interface Window {
    katex: any;
  }
  const katex: any;
}
