"use client";
import { useState, useImperativeHandle } from "react";

import { FormError } from "./FormError";

export interface IFormErrors {
  readonly clearErrors: () => void;
  readonly addError: (error: string | string[]) => void;
}

export interface FormErrorsProps {
  readonly handler: React.RefObject<IFormErrors>;
}

export const FormErrors = ({ handler }: FormErrorsProps): JSX.Element => {
  const [errors, setErrors] = useState<string[]>([]);

  useImperativeHandle(handler, () => ({
    clearErrors: () => setErrors([]),
    addError: (error: string | string[]) => {
      setErrors(prev => [...prev, ...(Array.isArray(error) ? error : [error])]);
    },
  }));

  if (errors.length === 0) {
    return <></>;
  }
  return (
    <div className="form__errors">
      {errors.map((e, i) => (
        <FormError key={i}>{e}</FormError>
      ))}
    </div>
  );
};
