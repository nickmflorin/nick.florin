import { type BaseFormValues, type FormInstance } from "../types";

import { FormError } from "./FormError";

export interface FormErrorsProps<I extends BaseFormValues> {
  readonly form: FormInstance<I>;
}

export const FormErrors = <I extends BaseFormValues>({ form }: FormErrorsProps<I>): JSX.Element => {
  if (form.errors.length === 0) {
    return <></>;
  }
  return (
    <div className="form__errors">
      {form.errors.map((e, i) => (
        <FormError key={i}>{e}</FormError>
      ))}
    </div>
  );
};
