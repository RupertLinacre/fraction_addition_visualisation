
import React, { useState, useCallback, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { VisualizationSection } from './components/VisualizationSection';
import { MathematicalSummary } from './components/MathematicalSummary';
import type { FractionInput, CalculationData, ValidatedFraction } from './types';
import { MAX_DENOMINATOR_PRODUCT, MAX_INDIVIDUAL_DENOMINATOR, TEXT_COLOR_DARK } from './constants';

// Define error object type for clarity
type ErrorObject = { f1Num?: string; f1Den?: string; f2Num?: string; f2Den?: string; general?: string };

const App: React.FC = () => {
  const initialFraction1: FractionInput = { num: '1', den: '2' };
  const initialFraction2: FractionInput = { num: '1', den: '3' };

  const [fraction1, setFraction1] = useState<FractionInput>(initialFraction1);
  const [fraction2, setFraction2] = useState<FractionInput>(initialFraction2);
  const [errors, setErrors] = useState<ErrorObject>({});
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleFractionChange = useCallback((id: 'f1' | 'f2', field: 'num' | 'den', value: string) => {
    const setter = id === 'f1' ? setFraction1 : setFraction2;
    setter(prev => ({ ...prev, [field]: value }));
    // Clear previous results immediately; useEffect will trigger recalculation
    setShowResults(false);
    setCalculationData(null); 
    // Errors will be managed by the automatic recalculation
  }, []);

  const validateAndProcessInputs = useCallback((): { data: CalculationData; errors: ErrorObject } => {
    const currentErrors: ErrorObject = {};
    const parsedF1Num = parseInt(fraction1.num, 10);
    const parsedF1Den = parseInt(fraction1.den, 10);
    const parsedF2Num = parseInt(fraction2.num, 10);
    const parsedF2Den = parseInt(fraction2.den, 10);

    const createErrorData = (msg: string, errs: ErrorObject, f1?: ValidatedFraction, f2?: ValidatedFraction): { data: CalculationData; errors: ErrorObject } => ({
      data: {
        isError: true,
        errorMessage: msg,
        f1: f1 || { num: NaN, den: NaN } as ValidatedFraction,
        f2: f2 || { num: NaN, den: NaN } as ValidatedFraction,
        commonDenominator: NaN,
        f1TransformedNum: NaN, f1TransformedDen: NaN,
        f2TransformedNum: NaN, f2TransformedDen: NaN,
        sumNum: NaN, sumDen: NaN,
      },
      errors: errs
    });

    if (isNaN(parsedF1Num) || fraction1.num === '') currentErrors.f1Num = 'Must be integer';
    if (isNaN(parsedF1Den) || fraction1.den === '') currentErrors.f1Den = 'Must be integer';
    if (isNaN(parsedF2Num) || fraction2.num === '') currentErrors.f2Num = 'Must be integer';
    if (isNaN(parsedF2Den) || fraction2.den === '') currentErrors.f2Den = 'Must be integer';

    if (Object.keys(currentErrors).length > 0) {
      return createErrorData("Invalid inputs. Please enter whole numbers.", currentErrors);
    }

    if (parsedF1Den <= 0) currentErrors.f1Den = 'Must be > 0';
    if (parsedF2Den <= 0) currentErrors.f2Den = 'Must be > 0';
    
    if (parsedF1Den > MAX_INDIVIDUAL_DENOMINATOR) currentErrors.f1Den = `Max ${MAX_INDIVIDUAL_DENOMINATOR}`;
    if (parsedF2Den > MAX_INDIVIDUAL_DENOMINATOR) currentErrors.f2Den = `Max ${MAX_INDIVIDUAL_DENOMINATOR}`;

    if (parsedF1Num < 0) currentErrors.f1Num = 'Must be >= 0';
    if (parsedF2Num < 0) currentErrors.f2Num = 'Must be >= 0';

    // Allow numerators to be 0, but not greater than denominator
    if (parsedF1Num > parsedF1Den && parsedF1Den > 0) currentErrors.f1Num = 'a ≤ b'; // Check only if den is valid
    if (parsedF2Num > parsedF2Den && parsedF2Den > 0) currentErrors.f2Num = 'x ≤ y'; // Check only if den is valid
    
    if (Object.keys(currentErrors).length > 0) {
      return createErrorData("Validation errors. Check individual fields.", currentErrors, 
        {num: parsedF1Num, den: parsedF1Den}, {num: parsedF2Num, den: parsedF2Den});
    }
    
    const f1Val: ValidatedFraction = { num: parsedF1Num, den: parsedF1Den };
    const f2Val: ValidatedFraction = { num: parsedF2Num, den: parsedF2Den };

    const commonDenominator = f1Val.den * f2Val.den;
    if (commonDenominator === 0) { 
        currentErrors.general = `Denominators cannot result in a zero common denominator.`;
        return createErrorData(currentErrors.general, currentErrors, f1Val, f2Val);
    }
    if (commonDenominator > MAX_DENOMINATOR_PRODUCT) {
      currentErrors.general = `Common denominator (b*y = ${commonDenominator}) exceeds max of ${MAX_DENOMINATOR_PRODUCT}. Try smaller denominators.`;
      return createErrorData(currentErrors.general, currentErrors, f1Val, f2Val);
    }

    const f1TransformedNum = f1Val.num * f2Val.den;
    const f2TransformedNum = f2Val.num * f1Val.den;
    const sumNum = f1TransformedNum + f2TransformedNum;

    if (sumNum > commonDenominator) {
        currentErrors.general = `Sum (${sumNum}/${commonDenominator}) is > 1. This visualizer currently supports sums ≤ 1.`;
        return createErrorData(currentErrors.general, currentErrors, f1Val, f2Val);
    }
    
    return {
      data: {
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
      },
      errors: {} // No errors
    };
  }, [fraction1, fraction2]); 

  useEffect(() => {
    setIsCalculating(true);

    const { data: resultData, errors: validationErrors } = validateAndProcessInputs();
    
    setErrors(validationErrors);
    setCalculationData(resultData); 

    if (resultData && !resultData.isError) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
    setIsCalculating(false);
  }, [fraction1, fraction2, validateAndProcessInputs]); 


  // handleReset function removed

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center space-y-8">
      <header className="text-center">
        <h1 className={`text-4xl font-bold text-[${TEXT_COLOR_DARK}]`}>Visual Fraction Addition</h1>
        {/* Subtitle paragraph removed */}
      </header>

      <InputSection
        fraction1={fraction1}
        fraction2={fraction2}
        onFractionChange={handleFractionChange}
        // onReset prop removed
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
