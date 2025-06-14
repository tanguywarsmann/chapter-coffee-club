
import { useState } from "react";

export const useValidationState = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetValidationState = () => {
    setValidationError(null);
    setValidationSegment(null);
    setIsValidating(false);
  };

  return {
    isValidating,
    setIsValidating,
    validationSegment,
    setValidationSegment,
    validationError,
    setValidationError,
    resetValidationState
  };
};
