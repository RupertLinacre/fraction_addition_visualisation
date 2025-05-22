import React, { useState, useCallback } from 'react';
import { InputSection } from './components/InputSection';
import { VisualizationSection } from './components/VisualizationSection';
import { MathematicalSummary } from './components/MathematicalSummary';
import type { FractionInput, CalculationData, ValidatedFraction } from './types';
import { MAX_DENOMINATOR_PRODUCT, MAX_INDIVIDUAL_DENOMINATOR, TEXT_COLOR_DARK } from './constants';

const App: React.FC = () => {
  const initialFraction1: FractionInput = { num: '1', den: '2' };
  const initialFraction2: FractionInput = { num: '1', den: '3' };

  const [fraction1, setFraction1] = useState<FractionInput>(initialFraction1);
  const [fraction2, setFraction2] = useState<FractionInput>(initialFraction2);
  const [errors, setErrors] = useState<{ f1Num?: string; f1Den?: string; f2Num?: string; f2Den?: string; general?: string }>({});
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleFractionChange = useCallback((id: 'f1' | 'f2', field: 'num' | 'den', value: string) => {
    const setter = id === 'f1' ? setFraction1 : setFraction2;
    setter(prev => ({ ...prev, [field]: value }));
    if (showResults) {
        // If user changes input after a calculation, effectively reset visualization part by hiding it
        setShowResults(false);
        setCalculationData(null); 
        // Errors are cleared on next submit, or if user resets explicitly
    }
  }, [showResults]);

  const validateAndCalculate = (): CalculationData | null => {
    const newErrors: typeof errors = {};
    const parsedF1Num = parseInt(fraction1.num, 10);
    const parsedF1Den = parseInt(fraction1.den, 10);
    const parsedF2Num = parseInt(fraction2.num, 10);
    const parsedF2Den = parseInt(fraction2.den, 10);

    if (isNaN(parsedF1Num) || fraction1.num === '') newErrors.f1Num = 'Must be integer';
    if (isNaN(parsedF1Den) || fraction1.den === '') newErrors.f1Den = 'Must be integer';
    if (isNaN(parsedF2Num) || fraction2.num === '') newErrors.f2Num = 'Must be integer';
    if (isNaN(parsedF2Den) || fraction2.den === '') newErrors.f2Den = 'Must be integer';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return { isError: true, errorMessage: "Invalid inputs.", f1: {} as ValidatedFraction, f2: {} as ValidatedFraction } as CalculationData;
    }

    if (parsedF1Den <= 0) newErrors.f1Den = 'Must be > 0';
    if (parsedF2Den <= 0) newErrors.f2Den = 'Must be > 0';
    
    if (parsedF1Den > MAX_INDIVIDUAL_DENOMINATOR) newErrors.f1Den = `Max ${MAX_INDIVIDUAL_DENOMINATOR}`;
    if (parsedF2Den > MAX_INDIVIDUAL_DENOMINATOR) newErrors.f2Den = `Max ${MAX_INDIVIDUAL_DENOMINATOR}`;

    if (parsedF1Num < 0) newErrors.f1Num = 'Must be >= 0';
    if (parsedF2Num < 0) newErrors.f2Num = 'Must be >= 0';

    if (parsedF1Num > parsedF1Den) newErrors.f1Num = 'a ≤ b';
    if (parsedF2Num > parsedF2Den) newErrors.f2Num = 'x ≤ y';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return { isError: true, errorMessage: "Validation errors.", f1: {} as ValidatedFraction, f2: {} as ValidatedFraction } as CalculationData;
    }
    
    const f1Val: ValidatedFraction = { num: parsedF1Num, den: parsedF1Den };
    const f2Val: ValidatedFraction = { num: parsedF2Num, den: parsedF2Den };

    const commonDenominator = f1Val.den * f2Val.den;
    if (commonDenominator === 0) { // Should be caught by parsedF1Den/parsedF2Den <= 0, but good to double check
        newErrors.general = `Denominators cannot be zero.`;
        setErrors(newErrors);
        return { isError: true, errorMessage: newErrors.general, f1: f1Val, f2: f2Val } as CalculationData;
    }
    if (commonDenominator > MAX_DENOMINATOR_PRODUCT) {
      newErrors.general = `Common denominator (b*y = ${commonDenominator}) exceeds max of ${MAX_DENOMINATOR_PRODUCT}. Try smaller denominators.`;
      setErrors(newErrors);
      return { isError: true, errorMessage: newErrors.general, f1: f1Val, f2: f2Val } as CalculationData;
    }

    const f1TransformedNum = f1Val.num * f2Val.den;
    const f2TransformedNum = f2Val.num * f1Val.den;
    const sumNum = f1TransformedNum + f2TransformedNum;

    if (sumNum > commonDenominator) {
        newErrors.general = `Sum (${sumNum}/${commonDenominator}) > 1. This visualizer currently supports sums ≤ 1.`;
        setErrors(newErrors);
        return { isError: true, errorMessage: newErrors.general, f1: f1Val, f2: f2Val } as CalculationData;
    }
    
    setErrors({});
    return {
      f1: f1Val,
      f2: f2Val,
      commonDenominator,
      f1TransformedNum,
      f1TransformedDen: commonDenominator,
      f2TransformedNum,
      f2TransformedDen: commonDenominator,
      sumNum,
      sumDen: commonDenominator,
      isError: false,
    };
  };

  const handleSubmit = useCallback(() => {
    setIsCalculating(true);
    setShowResults(false); // Hide previous results immediately
    setCalculationData(null); // Clear previous data
    setErrors({}); // Clear previous errors

    // Introduce a small delay for simulate calculation if needed, or direct call
    // setTimeout(() => {
      const result = validateAndCalculate();
      setCalculationData(result);

      if (result && result.isError) {
        // Errors are already set by validateAndCalculate, showResults remains false
        setShowResults(false); 
      } else if (result) {
        setShowResults(true);
      }
      setIsCalculating(false);
    // }, 50); // Optional small delay
  }, [fraction1, fraction2]); // Dependencies include fractions to re-create callback if they change


  const handleReset = useCallback(() => {
    setFraction1(initialFraction1);
    setFraction2(initialFraction2);
    setErrors({});
    setCalculationData(null);
    setShowResults(false);
    setIsCalculating(false);
  }, []); // initialFraction1 and initialFraction2 are stable

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center space-y-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${TEXT_COLOR_DARK}]`}>Visual Fraction Addition</h1>
        <p className={`mt-2 text-lg text-slate-600`}>
          See how fractions are added step-by-step.
        </p>
      </header>

      <InputSection
        fraction1={fraction1}
        fraction2={fraction2}
        onFractionChange={handleFractionChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        errors={errors}
        isCalculating={isCalculating}
      />

      {showResults && calculationData && !calculationData.isError && (
        <>
          <VisualizationSection calcData={calculationData} />
          <MathematicalSummary calcData={calculationData} />
        </>
      )}
    </div>
  );
};

export default App;