import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type FieldError } from "../types";

import { FormFieldError } from "./FieldError";

export interface FormFieldErrorsProps extends ComponentProps {
  readonly errors: FieldError[];
}

export const FormFieldErrors = ({ errors, ...props }: FormFieldErrorsProps): JSX.Element =>
  errors.length !== 0 ? (
    <div {...props} className={clsx("flex flex-col gap-[2px]", props.className)}>
      {errors.map((e, i) => (
        <FormFieldError key={i}>{e}</FormFieldError>
      ))}
    </div>
  ) : (
    <></>
  );
