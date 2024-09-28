import { useMemo } from "react";

import { ensuresDefinedValue } from "~/lib/typeguards";

import { type ComponentProps, classNames } from "~/components/types";

import {
  type BaseFormValues,
  type FieldError,
  type FieldErrors,
  type FormInstance,
  type FieldName,
} from "../types";

import { FormFieldError } from "./FieldError";

type FieldFormErrorsProps<N extends FieldName<I>, I extends BaseFormValues> = ComponentProps & {
  readonly form: FormInstance<I>;
  readonly name: N;
  readonly errors?: never;
};

type FieldExplicitErrorsProps = ComponentProps & {
  readonly form?: never;
  readonly name?: never;
  readonly errors: FieldError[];
};

export type FormFieldErrorsProps<N extends FieldName<I>, I extends BaseFormValues> =
  | FieldFormErrorsProps<N, I>
  | FieldExplicitErrorsProps;

export const FormFieldErrors = <N extends FieldName<I>, I extends BaseFormValues>({
  form,
  name,
  errors: _errors = [],
  ...props
}: FormFieldErrorsProps<N, I>): JSX.Element => {
  const fieldErrors = useMemo(() => (form ? form.fieldErrors : undefined), [form]);

  const errors = useMemo(() => {
    if (fieldErrors) {
      const _name = ensuresDefinedValue(Array.isArray(name) ? name[0] : name);
      return fieldErrors?.[_name as keyof FieldErrors<I>] ?? [];
    }
    return _errors;
  }, [_errors, name, fieldErrors]);

  if (errors.length !== 0) {
    return (
      <div {...props} className={classNames("flex flex-col gap-[2px]", props.className)}>
        {errors.map((e, i) => (
          <FormFieldError key={i}>{e}</FormFieldError>
        ))}
      </div>
    );
  }
  return <></>;
};
