import { useCallback, useMemo, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { uniq } from 'lodash-es';
import {
  type FieldErrors as NativeFieldErrors,
  type Path,
  type PathValue,
  type RegisterOptions,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormRegisterReturn,
  useForm as useReactHookForm,
} from 'react-hook-form';
import { z } from 'zod';

import { logger } from '~/internal/logger';
import { humanizeList } from '~/lib/formatters';
import { flattenObjectPaths, type IterablePathObj } from '~/lib/objects';

import {
  type ApiClientErrorJson,
  ApiClientFieldErrorCodes,
  type ApiClientFieldErrorsObj,
  ApiClientFormError,
  type ApiError,
  isApiClientFormErrorJson,
  isApiError,
} from '~/api';

import {
  type BaseFormValues,
  type ControlledFieldChangeHandler,
  type FieldErrors,
  type FieldName,
  type FieldValue,
  type FormConfig,
  type FormInstance,
  type SetFormErrors,
} from '../types';

const ReactHookFormFieldErrorObjectSchema = z.object({
  message: z.string(),
  type: z.string().optional(),
});

type FieldErrorObj = z.infer<typeof ReactHookFormFieldErrorObjectSchema>;

const isReactHookFormFieldErrorObject = (obj: unknown): obj is FieldErrorObj =>
  ReactHookFormFieldErrorObjectSchema.safeParse(obj).success;

const isInternalFieldErrors = (obj: unknown): obj is string[] =>
  z.array(z.string()).safeParse(obj).success;

/**
 * Sets a global form error from `e.message`, used when an {@link ApiClientErrorJson} or
 * {@link ApiError} does not contain errors for individual fields, and should instead be treated
 * globally.
 */
const setGlobalErrorFromMessage = <I extends BaseFormValues>(
  setErrors: SetFormErrors<I>,
  e: { message: string },
) => setErrors(e.message);

function mergeIntoFieldErrors<I extends BaseFormValues>(
  a: FieldErrors<I>,
  b: FieldErrors<I> | NativeFieldErrors,
): FieldErrors<I>;

function mergeIntoFieldErrors<I extends BaseFormValues>(
  errors: FieldErrors<I>,
  key: FieldName<I>,
  err: string | string[],
): FieldErrors<I>;

function mergeIntoFieldErrors<I extends BaseFormValues>(
  arg0: FieldErrors<I>,
  arg1: FieldErrors<I> | FieldName<I> | NativeFieldErrors,
  arg2?: string | string[],
): FieldErrors<I> {
  if (arg2) {
    if (typeof arg1 !== 'string') {
      throw new TypeError('Invalid method implementation.');
    }
    return {
      ...arg0,
      [arg1]: (Array.isArray(arg2) ? arg2 : [arg2]).reduce((prev: string[], curr: string) => {
        if (prev.includes(curr)) {
          /* This should never happen, but has happened in cases where static field errors were set
             on the form after a failed API request made with a hook. */
          logger.warn(`The form received a duplicate error message for field '${arg1}': ${curr}.`);
          return prev;
        }
        return [...prev, curr];
      }, arg0[arg1] ?? []),
    };
  } else if (typeof arg1 === 'string') {
    throw new TypeError('Invalid method implementation.');
  }
  const flattened = flattenObjectPaths<FieldErrorObj | string[]>(
    arg1 as IterablePathObj<FieldErrorObj | string[]>,
    {
      continueOn: (v): v is IterablePathObj<FieldErrorObj | string[]> =>
        !isReactHookFormFieldErrorObject(v) && !isInternalFieldErrors(v),
      formatter: path => path.join('.'),
    },
  );
  return Object.keys(flattened).reduce((prev, key) => {
    const errs = flattened[key as FieldName<I>];
    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Indexing into a
       'Record' does not produce a possibly undefined type because 'noUncheckedIndexedAccess' is
       not enabled. */
    if (errs !== undefined) {
      if (isInternalFieldErrors(errs)) {
        return mergeIntoFieldErrors(prev, key as FieldName<I>, errs);
      } else if (isReactHookFormFieldErrorObject(errs)) {
        return mergeIntoFieldErrors(prev, key as FieldName<I>, errs.message);
      }
      throw new Error('Unexpectedly encountered malformed value in flattened errors object!');
    }
    return prev;
  }, arg0);
}

export const useForm = <I extends BaseFormValues, IN = I>({
  onChange,
  schema,
  ...options
}: FormConfig<I, IN>): FormInstance<I> => {
  const [storedFieldErrors, setStoredFieldErrors] = useState<FieldErrors<I>>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const registeredFields = useRef<FieldName<I>[]>([]);

  const {
    clearErrors: clearNativeErrors,
    formState,
    getValues,
    handleSubmit: _handleSubmit,
    register: _register,
    setError: _setError,
    setValue,
    setValues: _setValues,
    ...form
  } = useReactHookForm<I>({
    ...options,
    resolver: zodResolver(schema),
  });

  const setValues = useMemo(
    () => (values: { [key in Path<I>]: PathValue<I, key> }) => {
      for (const key in values) {
        const k = key as Path<I>;
        if (Object.prototype.hasOwnProperty.call(values, k)) {
          setValue(k, values[k]);
        }
      }
    },
    [setValue],
  );

  const register = useMemo(
    () =>
      <N extends FieldName<I>>(
        name: N,
        registerOptions?: RegisterOptions<I, N>,
      ): UseFormRegisterReturn<N> => {
        registeredFields.current = uniq([...registeredFields.current, name]);
        const registration = _register(name, registerOptions);
        return {
          ...registration,
          onChange: (...args) => {
            /* React Hook Form types the change event's target as 'any'.  The event is dispatched
               by the native form control that the field was registered with, so the target's
               value is the value of that field. */
            const { value } = args[0].target as { value: FieldValue<N, I> };
            onChange?.({ name, value, values: { ...getValues(), [name]: value } });
            return registration.onChange(...args);
          },
        };
      },
    [_register, getValues, onChange],
  );

  const registerChangeHandler = useMemo(
    () =>
      <N extends FieldName<I>>(
        name: N,
        handler: ControlledFieldChangeHandler<N, I>,
      ): ControlledFieldChangeHandler<N, I> => {
        registeredFields.current = uniq([...registeredFields.current, name]);

        const fn: ControlledFieldChangeHandler<N, I> = value => {
          onChange?.({ name, value, values: { ...getValues(), [name]: value } });
          handler(value);
        };
        return fn;
      },
    [getValues, onChange],
  );

  const setInternalFieldErrors = useCallback((fieldErrors: FieldErrors<I>) => {
    const invalidFields = Object.keys(fieldErrors).reduce((prev: string[], curr: string) => {
      if (!registeredFields.current.includes(curr as FieldName<I>)) {
        return [...prev, curr];
      }
      return prev;
    }, [] as string[]);
    if (invalidFields.length !== 0) {
      const humanized = humanizeList(registeredFields.current, {
        conjunction: 'and',
        formatter: v => `'${v}'`,
      });
      logger.warn(
        'The form received field errors for fields that are not registered with the form! ' +
          `Current fields registered with the form are: ${humanized}.`,
        { invalidFields, registered: registeredFields.current },
      );
    }
    return setStoredFieldErrors(fieldErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setGlobalErrors([]);
    setInternalFieldErrors({});
    clearNativeErrors();
  }, [clearNativeErrors, setInternalFieldErrors]);

  const setErrors: SetFormErrors<I> = useCallback(
    (arg0: FieldErrors<I> | FieldName<I> | string | string[], arg1?: string | string[]) => {
      if (arg1) {
        if (typeof arg0 !== 'string') {
          throw new TypeError('Invalid method implementation!');
        }
        return setInternalFieldErrors({
          [arg0 as FieldName<I>]: Array.isArray(arg1) ? arg1 : [arg1],
        } as FieldErrors<I>);
      } else if (typeof arg0 === 'string' || Array.isArray(arg0)) {
        return setGlobalErrors(Array.isArray(arg0) ? arg0 : [arg0]);
      }
      setInternalFieldErrors(arg0);
    },
    [setInternalFieldErrors],
  );

  const setInternalFieldErrorsFromResponse = useCallback(
    (e: ApiClientErrorJson | ApiClientFormError, errs: ApiClientFieldErrorsObj) => {
      // If this happens, it means the API incorrectly returned an error response.
      if (Object.keys(errs).length === 0) {
        logger.warn(
          'The form received an ApiClientFieldErrorsObj object with an empty set of errors!',
          { error: e },
        );
      }
      return setInternalFieldErrors(
        Object.keys(errs).reduce((prev: FieldErrors<I>, key): FieldErrors<I> => {
          const _details = errs[key];
          const details = _details ? (Array.isArray(_details) ? _details : [_details]) : _details;
          if (details && details.length !== 0) {
            return {
              ...prev,
              [key as FieldName<I>]: details.map(detail => {
                const fn = ApiClientFieldErrorCodes.getAttribute(detail.code, 'message');
                /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The
                   errors can originate from a deserialized API response, in which case the
                   message is not guaranteed to be present at runtime. */
                return detail.message ?? fn(key);
              }),
            };
          }
          // If this happens, it means the API incorrectly returned an error response.
          logger.warn(
            'The form received an ApiClientFieldErrorsObj object with an error ' +
              `key '${key}' that does not contain any errors!`,
            { error: e, key },
          );
          return prev;
        }, {} as FieldErrors<I>),
      );
    },
    [setInternalFieldErrors],
  );

  const handleApiError = useCallback(
    (e: ApiClientErrorJson | ApiError) => {
      if (isApiError(e)) {
        if (e instanceof ApiClientFormError) {
          return setInternalFieldErrorsFromResponse(e, e.errors);
        }
        return setGlobalErrorFromMessage(setErrors, e);
      } else if (isApiClientFormErrorJson(e)) {
        return setInternalFieldErrorsFromResponse(e, e.errors);
      }
      return setGlobalErrorFromMessage(setErrors, e);
    },
    [setErrors, setInternalFieldErrorsFromResponse],
  );

  const fieldErrors = useMemo(
    () => mergeIntoFieldErrors(storedFieldErrors, formState.errors),
    [formState.errors, storedFieldErrors],
  );

  /* React Hook Form's 'handleSubmit' is now generic over the result of the submit handler, so this
     wrapper has to thread that type parameter through in order to remain assignable to it. */
  const handleSubmit = useCallback(
    <TResult>(fn: SubmitHandler<I, TResult>, onError?: SubmitErrorHandler<I>) =>
      _handleSubmit<TResult>((data: I) => {
        clearErrors();
        return fn(data);
      }, onError),
    [clearErrors, _handleSubmit],
  );

  return {
    clearErrors,
    errors: globalErrors,
    fieldErrors,
    formState,
    getValues,
    handleApiError,
    handleSubmit,
    register,
    registerChangeHandler,
    setErrors,
    setValue,
    setValues,
    ...form,
  };
};
