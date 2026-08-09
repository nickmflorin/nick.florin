import { type JSX, useMemo } from 'react';

import { ensuresDefinedValue } from '~/lib/typeguards';

import { classNames, type ComponentProps } from '~/components/types';

import {
  type BaseFormValues,
  type FieldError,
  type FieldErrors,
  type FieldName,
  type FormInstance,
} from '../types';

import { FormFieldError } from './FieldError';

type FieldFormErrorsProps<N extends FieldName<I>, I extends BaseFormValues> = {
  /**
   * Errors provided directly by the caller, rendered after (and in addition to) whatever errors
   * the form holds for the field. Lets render-derived errors — e.g. a failed data load resolved
   * during render — display on the field without being imperatively written into form state.
   */
  readonly errors?: FieldError[];
  readonly form: FormInstance<I>;
  readonly name: N;
} & ComponentProps;

type FieldExplicitErrorsProps = {
  readonly errors: FieldError[];
  readonly form?: never;
  readonly name?: never;
} & ComponentProps;

export type FormFieldErrorsProps<N extends FieldName<I>, I extends BaseFormValues> =
  FieldExplicitErrorsProps | FieldFormErrorsProps<N, I>;

export const FormFieldErrors = <N extends FieldName<I>, I extends BaseFormValues>({
  errors: _errors = [],
  form,
  name,
  ...props
}: FormFieldErrorsProps<N, I>): JSX.Element | null => {
  const fieldErrors = useMemo(() => (form ? form.fieldErrors : undefined), [form]);

  const errors = useMemo(() => {
    if (fieldErrors) {
      const _name = ensuresDefinedValue(name);
      return [...(fieldErrors[_name as keyof FieldErrors<I>] ?? []), ..._errors];
    }
    return _errors;
  }, [_errors, name, fieldErrors]);

  if (errors.length !== 0) {
    return (
      <div {...props} className={classNames('flex flex-col gap-[2px]', props.className)}>
        {errors.map((e, i) => (
          <FormFieldError key={i}>{e}</FormFieldError>
        ))}
      </div>
    );
  }
  return null;
};
