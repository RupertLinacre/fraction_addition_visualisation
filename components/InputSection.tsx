
import React from 'react';
import type { FractionInput } from '../types';
import { TEXT_COLOR_DARK, ERROR_COLOR } from '../constants';

interface InputSectionProps {
  fraction1: FractionInput;
  fraction2: FractionInput;
  onFractionChange: (id: 'f1' | 'f2', field: 'num' | 'den', value: string) => void;
  errors: { f1Num?: string; f1Den?: string; f2Num?: string; f2Den?: string; general?: string };
  isCalculating: boolean; 
}

// InputField component is simplified: internal label element is removed.
// It now relies on an external label or aria-label for accessibility.
const InputField: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  ariaLabel: string; // For accessibility, as internal label is removed
}> = ({ id, value, onChange, error, placeholder, ariaLabel }) => (
  <div className="flex flex-col items-center"> {/* This div helps center the input and its error message */}
    <input
      id={id}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "0"}
      className={`w-20 p-2 text-center bg-white text-slate-900 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-label={ariaLabel}
    />
    {error && <p id={`${id}-error`} className={`mt-1 text-xs text-[${ERROR_COLOR}] w-20 text-center`}>{error}</p>}
  </div>
);

export const InputSection: React.FC<InputSectionProps> = ({
  fraction1,
  fraction2,
  onFractionChange,
  errors,
  isCalculating 
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg"> {/* Adjusted max-width */}
      
      {errors.general && (
        <div role="alert" className={`mb-4 p-3 bg-red-100 border border-[${ERROR_COLOR}] text-[${ERROR_COLOR}] rounded-md text-sm`}>
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1">
        {/* Row 1: Numerator Inputs */}
        <label htmlFor="f1Num" className={`text-sm font-medium text-[${TEXT_COLOR_DARK}] justify-self-end pr-2`}>Numerator</label>
        <InputField 
          id="f1Num" 
          value={fraction1.num} 
          onChange={(val) => onFractionChange('f1', 'num', val)} 
          error={errors.f1Num} 
          placeholder="a"
          ariaLabel="Numerator for first fraction (a)"
        />
        
        {/* This cell contains the '+' sign, spanning 3 rows vertically (Num, Line, Den) */}
        <div className="row-span-3 flex items-center justify-center px-2">
          <span className={`text-4xl font-bold text-[${TEXT_COLOR_DARK}]`}>+</span>
        </div>

        <InputField 
          id="f2Num" 
          value={fraction2.num} 
          onChange={(val) => onFractionChange('f2', 'num', val)} 
          error={errors.f2Num} 
          placeholder="x"
          ariaLabel="Numerator for second fraction (x)"
        />

        {/* Row 2: Fraction Lines (empty cell for label alignment) */}
        <div aria-hidden="true"></div> 
        <div className={`w-full h-0.5 bg-[${TEXT_COLOR_DARK}] my-1 mx-auto max-w-[5rem]`}></div> {/* Line for f1, max-w-xs ensures it's under input */}
        {/* Operator is in the middle column, already placed and spanning */}
        <div className={`w-full h-0.5 bg-[${TEXT_COLOR_DARK}] my-1 mx-auto max-w-[5rem]`}></div> {/* Line for f2, max-w-xs */}
        
        {/* Row 3: Denominator Inputs */}
        <label htmlFor="f1Den" className={`text-sm font-medium text-[${TEXT_COLOR_DARK}] justify-self-end pr-2`}>Denominator</label>
        <InputField 
          id="f1Den" 
          value={fraction1.den} 
          onChange={(val) => onFractionChange('f1', 'den', val)} 
          error={errors.f1Den} 
          placeholder="b"
          ariaLabel="Denominator for first fraction (b)"
        />
        {/* Operator is in the middle column, already placed and spanning */}
        <InputField 
          id="f2Den" 
          value={fraction2.den} 
          onChange={(val) => onFractionChange('f2', 'den', val)} 
          error={errors.f2Den} 
          placeholder="y"
          ariaLabel="Denominator for second fraction (y)"
        />
      </div>
    </div>
  );
};
