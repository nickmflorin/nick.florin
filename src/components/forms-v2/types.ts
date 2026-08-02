import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import {
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { type z } from 'zod';

import { type ApiClientErrorJson, type ApiError } from '~/api';

export type BaseFormValues = FieldValues;

export type FieldError = string;

export const FieldConditions = enumeratedLiterals(['required', 'optional'] as const, {});
export type FieldCondition = EnumeratedLiteralsMember<typeof FieldConditions>;

export type FieldErrorAssertion = (v: unknown) => asserts v is FieldError;

export const assertFieldError: FieldErrorAssertion = (v: unknown) => {
  if (typeof v !== 'string') {
    throw new TypeError(`The value ${JSON.stringify(v)} is not a valid field error!`);
  }
};

export const assertFieldErrorOrErrors: FieldErrorAssertion = (v: unknown) => {
  if (Array.isArray(v)) {
    v.map((vi: unknown) => assertFieldError(vi));
  } else if (typeof v !== 'string') {
    throw new TypeError(`The value ${JSON.stringify(v)} is not a valid field error!`);
  }
};

export type FieldName<I extends BaseFormValues> = Path<I>;

export type FormValues<I extends BaseFormValues> = { [key in Path<I>]: PathValue<I, key> };
export type FieldValue<N extends FieldName<I>, I extends BaseFormValues> = PathValue<I, N>;

export type FieldErrors<I extends BaseFormValues> = Partial<Record<FieldName<I>, string[]>>;

export type FormConfig<I extends BaseFormValues, IN = I> = {
  readonly onChange?: <N extends FieldName<I>>(params: {
    name: N;
    value: FieldValue<N, I>;
    values: FormValues<I>;
  }) => void;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly schema: z.ZodSchema<I, any, IN>;
} & Omit<UseFormProps<I>, 'resolver'>;

export type ControlledFieldChangeHandler<N extends FieldName<I>, I extends BaseFormValues> = (
  value: FieldValue<N, I>,
) => void;

export type SetFormErrors<I extends BaseFormValues> = {
  (errors: FieldErrors<I>): void;
  (errors: string | string[]): void;
  (field: FieldName<I>, errors: string | string[]): void;
};

/**
 * The return value of {@link useForm}.
 *
 * `setValues`, added by React Hook Form in v7.84, is omitted from the underlying React Hook Form
 * return type because {@link useForm} defines its own version of it, with different semantics: it
 * assigns each field individually via `setValue`, rather than merging a partial object.
 */
export type FormInstance<I extends BaseFormValues> = {
  readonly clearErrors: () => void;
  readonly errors: string[];
  readonly fieldErrors: FieldErrors<I>;
  readonly handleApiError: (e: ApiClientErrorJson | ApiError) => void;
  readonly registerChangeHandler: <N extends FieldName<I>>(
    name: N,
    handler: ControlledFieldChangeHandler<N, I>,
  ) => ControlledFieldChangeHandler<N, I>;
  readonly setErrors: SetFormErrors<I>;
  readonly setValues: (values: FormValues<I>) => void;
} & Omit<UseFormReturn<I>, 'setError' | 'setValues'>;
