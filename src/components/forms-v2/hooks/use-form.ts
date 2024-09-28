import { useCallback, useMemo, useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { omit, uniq } from "lodash-es";
import {
  useForm as useReactHookForm,
  type Path,
  type PathValue,
  type UseFormRegisterReturn,
  type FieldErrors as NativeFieldErrors,
  type RegisterOptions,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";
import { z } from "zod";

import { logger } from "~/internal/logger";
import { humanizeList } from "~/lib/formatters";
import { flattenObjectPaths, type IterablePathObj } from "~/lib/objects";

import { ApiClientFormError, isApiError } from "~/api-v2";
import {
  type ApiError,
  type ApiClientErrorJson,
  type ApiClientFieldErrorsObj,
  ApiClientFieldErrorCodes,
  isApiClientFormErrorJson,
} from "~/api-v2";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldName,
  type FormConfig,
  type ControlledFieldChangeHandler,
  type FieldErrors,
  type SetFormErrors,
} from "../types";

const ReactHookFormFieldErrorObjectSchema = z.object({
  type: z.string().optional(),
  message: z.string(),
});

type FieldErrorObj = z.infer<typeof ReactHookFormFieldErrorObjectSchema>;

const isReactHookFormFieldErrorObject = (obj: unknown): obj is FieldErrorObj =>
  ReactHookFormFieldErrorObjectSchema.safeParse(obj).success;

const isInternalFieldErrors = (obj: unknown): obj is string[] =>
  z.array(z.string()).safeParse(obj).success;

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
  arg1: FieldName<I> | FieldErrors<I> | NativeFieldErrors,
  arg2?: string | string[],
): FieldErrors<I> {
  if (arg2) {
    if (typeof arg1 !== "string") {
      throw new TypeError("Invalid method implementation.");
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
  } else if (typeof arg1 === "string") {
    throw new TypeError("Invalid method implementation.");
  }
  const flattened = flattenObjectPaths<FieldErrorObj | string[]>(
    arg1 as IterablePathObj<FieldErrorObj | string[]>,
    {
      continueOn: (v): v is IterablePathObj<FieldErrorObj | string[]> =>
        !isReactHookFormFieldErrorObject(v) && !isInternalFieldErrors(v),
      formatter: path => path.join("."),
    },
  );
  return Object.keys(flattened).reduce((prev, key) => {
    const errs = flattened[key as FieldName<I>];
    if (errs !== undefined) {
      if (isInternalFieldErrors(errs)) {
        return mergeIntoFieldErrors(prev, key as FieldName<I>, errs);
      } else if (isReactHookFormFieldErrorObject(errs)) {
        return mergeIntoFieldErrors(prev, key as FieldName<I>, errs.message);
      } else {
        throw new Error("Unexpectedly encountered malformed value in flattened errors object!");
      }
    }
    return prev;
  }, arg0);
}

export const useForm = <I extends BaseFormValues, IN = I>({
  schema,
  onChange,
  ...options
}: FormConfig<I, IN>): FormInstance<I> => {
  const [internalFieldErrors, _setInternalFieldErrors] = useState<FieldErrors<I>>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);
  const registeredFields = useRef<FieldName<I>[]>([]);

  const {
    setValue,
    getValues,
    handleSubmit: _handleSubmit,
    clearErrors: clearNativeErrors,
    register: _register,
    formState,
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
        options?: RegisterOptions<I, N>,
      ): UseFormRegisterReturn<N> => {
        registeredFields.current = uniq([...registeredFields.current, name]);
        const registration = _register(name, options);
        return {
          ...registration,
          onChange: (...args) => {
            onChange?.({
              name,
              value: args[0].target.value,
              values: { ...getValues(), [name]: args[0].target.value },
            });
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
        conjunction: "and",
        formatter: v => `'${v}'`,
      });
      logger.warn(
        "The form received field errors for fields that are not registered with the form! " +
          `Current fields registered with the form are: ${humanized}.`,
        { invalidFields, registered: registeredFields.current },
      );
    }
    return _setInternalFieldErrors(fieldErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setGlobalErrors([]);
    setInternalFieldErrors({});
    clearNativeErrors();
  }, [clearNativeErrors, setInternalFieldErrors]);

  const setErrors: SetFormErrors<I> = useCallback(
    (arg0: FieldName<I> | FieldErrors<I> | string | string[], arg1?: string | string[]) => {
      if (arg1) {
        if (typeof arg0 !== "string") {
          throw new TypeError("Invalid method implementation!");
        }
        return setInternalFieldErrors({
          [arg0 as FieldName<I>]: Array.isArray(arg1) ? arg1 : [arg1],
        } as FieldErrors<I>);
      } else if (typeof arg0 === "string" || Array.isArray(arg0)) {
        return setGlobalErrors(Array.isArray(arg0) ? arg0 : [arg0]);
      } else {
        setInternalFieldErrors(arg0);
      }
    },
    [setInternalFieldErrors],
  );

  const setInternalFieldErrorsFromResponse = useCallback(
    (e: ApiClientFormError | ApiClientErrorJson, errs: ApiClientFieldErrorsObj) => {
      // If this happens, it means the API incorrectly returned an error response.
      if (Object.keys(errs).length === 0) {
        logger.warn(
          "The form received an ApiClientFieldErrorsObj object with an empty set of errors!",
          { error: e },
        );
      }
      return setInternalFieldErrors(
        Object.keys(errs).reduce((prev: FieldErrors<I>, key): FieldErrors<I> => {
          const _details = (errs as ApiClientFieldErrorsObj)[key];
          const details = _details ? (Array.isArray(_details) ? _details : [_details]) : _details;
          if (details && details.length !== 0) {
            return {
              ...prev,
              [key as FieldName<I>]: details.map(detail => {
                const fn = ApiClientFieldErrorCodes.getAttribute(detail.code, "message");
                return detail.message ?? fn(key);
              }),
            };
          }
          // If this happens, it means the API incorrectly returned an error response.
          logger.warn(
            "The form received an ApiClientFieldErrorsObj object with an error " +
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
    (e: ApiError | ApiClientErrorJson) => {
      if (isApiError(e)) {
        if (e instanceof ApiClientFormError) {
          return setInternalFieldErrorsFromResponse(e, e.errors);
        }
        /* In this case, the ApiClientError does not contain errors for individual fields, and
           should be treated globally. */
        return setErrors(e.message);
      } else if (isApiClientFormErrorJson(e)) {
        return setInternalFieldErrorsFromResponse(e, e.errors);
      } else {
        /* In this case, the ApiClientError does not contain errors for individual fields, and
           should be treated globally. */
        return setErrors(e.message);
      }
    },
    [setErrors, setInternalFieldErrorsFromResponse],
  );

  const fieldErrors = useMemo(
    () => mergeIntoFieldErrors(internalFieldErrors, formState.errors),
    [formState.errors, internalFieldErrors],
  );

  const handleSubmit = useCallback(
    (fn: SubmitHandler<I>, onError?: SubmitErrorHandler<I> | undefined) =>
      _handleSubmit((data: I) => {
        clearErrors();
        return fn(data);
      }, onError),
    [clearErrors, _handleSubmit],
  );

  return {
    formState,
    errors: globalErrors,
    fieldErrors,
    handleSubmit,
    handleApiError,
    setValue,
    setValues,
    register,
    getValues,
    registerChangeHandler,
    clearErrors,
    setErrors,
    ...omit(form, ["setError"]),
  };
};
