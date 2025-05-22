
import React from 'react';
import type { FractionInput } from '../types';
import { TEXT_COLOR_DARK, ERROR_COLOR } from '../constants';

interface InputSectionProps {
  fraction1: FractionInput;
  fraction2: FractionInput;
  onFractionChange: (id: 'f1' | 'f2', field: 'num' | 'den', value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  errors: { f1Num?: string; f1Den?: string; f2Num?: string; f2Den?: string; general?: string };
  isCalculating: boolean;
}

const InputField: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  placeholder?: string;
}> = ({ id, value, onChange, label, error, placeholder }) => (
  <div className="flex flex-col items-center">
    <label htmlFor={id} className={`text-sm font-medium ${error ? `text-[${ERROR_COLOR}]` : `text-[${TEXT_COLOR_DARK}]`}`}>{label}</label>
    <input
      id={id}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "0"}
      className={`mt-1 w-20 p-2 text-center bg-white text-slate-900 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
    />
    {error && <p className={`mt-1 text-xs text-[${ERROR_COLOR}]`}>{error}</p>}
  </div>
);

export const InputSection: React.FC<InputSectionProps> = ({
  fraction1,
  fraction2,
  onFractionChange,
  onSubmit,
  onReset,
  errors,
  isCalculating
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className={`text-2xl font-semibold text-center mb-6 text-[${TEXT_COLOR_DARK}]`}>Enter Fractions</h2>
      
      {errors.general && (
        <div className={`mb-4 p-3 bg-red-100 border border-[${ERROR_COLOR}] text-[${ERROR_COLOR}] rounded-md text-sm`}>
          {errors.general}
        </div>
      )}

      <div className="flex items-start justify-center space-x-8">
        {/* Fraction 1 */}
        <div className="flex flex-col items-center space-y-1">
          <InputField id="f1Num" value={fraction1.num} onChange={(val) => onFractionChange('f1', 'num', val)} label="Numerator (a)" error={errors.f1Num} placeholder="a"/>
          <div className={`w-16 h-0.5 bg-[${TEXT_COLOR_DARK}] my-1`}></div>
          <InputField id="f1Den" value={fraction1.den} onChange={(val) => onFractionChange('f1', 'den', val)} label="Denominator (b)" error={errors.f1Den} placeholder="b"/>
        </div>

        {/* Operator */}
        <div className="flex items-center h-full pt-16">
          <span className={`text-4xl font-bold text-[${TEXT_COLOR_DARK}]`}>+</span>
        </div>

        {/* Fraction 2 */}
        <div className="flex flex-col items-center space-y-1">
          <InputField id="f2Num" value={fraction2.num} onChange={(val) => onFractionChange('f2', 'num', val)} label="Numerator (x)" error={errors.f2Num} placeholder="x"/>
          <div className={`w-16 h-0.5 bg-[${TEXT_COLOR_DARK}] my-1`}></div>
          <InputField id="f2Den" value={fraction2.den} onChange={(val) => onFractionChange('f2', 'den', val)} label="Denominator (y)" error={errors.f2Den} placeholder="y"/>
        </div>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <button
          onClick={onSubmit}
          disabled={isCalculating}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors"
        >
          {isCalculating ? 'Calculating...' : 'Visualize Sum'}
        </button>
        <button
          onClick={onReset}
          disabled={isCalculating}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};