import React from 'react';
import type { CalculationData } from '../types';
import { TEXT_COLOR_DARK } from '../constants';
import KatexDisplay from './KatexDisplay';

interface MathematicalSummaryProps {
  calcData: CalculationData | null;
}

export const MathematicalSummary: React.FC<MathematicalSummaryProps> = ({ calcData }) => {
  if (!calcData || calcData.isError) {
    return null;
  }

  const { f1, f2, commonDenominator, f1TransformedNum, f2TransformedNum, sumNum } = calcData;

  const steps = [
    `\\frac{${f1.num}}{${f1.den}} + \\frac{${f2.num}}{${f2.den}}`,
    `= \\frac{${f1TransformedNum}}{${commonDenominator}} + \\frac{${f2TransformedNum}}{${commonDenominator}}`,
    `= \\frac{${f1TransformedNum} + ${f2TransformedNum}}{${commonDenominator}}`,
    `= \\frac{${sumNum}}{${commonDenominator}}`
  ];

  return (
    <div className={`w-full max-w-xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg text-[${TEXT_COLOR_DARK}]`}>
      <h2 className="text-2xl font-semibold text-center mb-6">Mathematical Summary</h2>
      <div className="space-y-4 text-xl text-center"> {/* Increased space-y for better KaTeX spacing */}
        {steps.map((step, index) => (
          <div key={index} className="opacity-100 py-1"> {/* Added py-1 for vertical spacing */}
            <KatexDisplay latex={step} block={false} /> {/* block={false} for better centering if line is short */}
          </div>
        ))}
      </div>
    </div>
  );
};
