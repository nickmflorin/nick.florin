import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { FormError } from "./FormError";
import { type BaseFormValues, type FormInstance } from "./types";

export interface FormErrorsProps<I extends BaseFormValues> extends ComponentProps {
  readonly form: FormInstance<I>;
}

export const FormErrors = <I extends BaseFormValues>({
  form,
  ...props
}: FormErrorsProps<I>): JSX.Element => {
  if (form.errors.length === 0) {
    return <></>;
  }
  return (
    <div {...props} className={clsx("flex flex-col gap-[2px]", props.className)}>
      {form.errors.map((e, i) => (
        <FormError key={i}>{e}</FormError>
      ))}
    </div>
  );
};
