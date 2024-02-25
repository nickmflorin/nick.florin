import { useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import union from "lodash.union";
import {
  useForm as useReactHookForm,
  type Path,
  type PathValue,
  type UseFormRegisterReturn,
  type RegisterOptions,
} from "react-hook-form";

import {
  ApiClientError,
  type HttpError,
  ApiClientFieldErrorCodes,
  type ApiClientErrorResponse,
  isApiClientFieldErrorsResponse,
  type ApiClientFieldError,
} from "~/application/errors";
import { logger } from "~/application/logger";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldName,
  type FormConfig,
  type ControlledFieldChangeHandler,
  type FieldErrors,
  type SetFormErrors,
} from "./types";

export const useForm = <I extends BaseFormValues, IN = I>({
  schema,
  onChange,
  ...options
}: FormConfig<I, IN>): FormInstance<I> => {
  const [internalFieldErrors, setInternalFieldErrors] = useState<FieldErrors<I>>({});
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const {
    setValue,
    getValues,
    clearErrors: clearNativeErrors,
    register: _register,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    setError: setNativeError,
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
        const fn: ControlledFieldChangeHandler<N, I> = value => {
          onChange?.({ name, value, values: { ...getValues(), [name]: value } });
          handler(value);
        };
        return fn;
      },
    [getValues, onChange],
  );

  const clearErrors = useCallback(() => {
    setGlobalErrors([]);
    setInternalFieldErrors({});
    clearNativeErrors();
  }, [clearNativeErrors]);

  const setErrors: SetFormErrors<I> = useCallback(
    (arg0: FieldName<I> | FieldErrors<I> | string | string[], arg1?: string | string[]) => {
      if (arg1) {
        if (typeof arg0 !== "string") {
          throw new TypeError("Invalid method implementation!");
        }
        return setInternalFieldErrors({
          [arg0 as FieldName<I>]: [...(Array.isArray(arg1) ? arg1 : [arg1])],
        } as FieldErrors<I>);
      } else if (typeof arg0 === "string" || Array.isArray(arg0)) {
        return setGlobalErrors([...(Array.isArray(arg0) ? arg0 : [arg0])]);
      } else {
        setInternalFieldErrors(arg0);
      }
    },
    [],
  );

  const handleApiError = useCallback(
    (e: HttpError | ApiClientErrorResponse) => {
      if (
        (e instanceof ApiClientError && e.errors !== undefined) ||
        isApiClientFieldErrorsResponse(e)
      ) {
        // If this happens, it means the API incorrectly returned an error response.
        if ((e.errors as ApiClientFieldError[]).length === 0) {
          logger.warn(
            "The form received an ApiClientErrorResponse or ApiClientError with an empty " +
              "array of errors!",
            { error: e },
          );
        }
        return setInternalFieldErrors(
          (e.errors as ApiClientFieldError[]).reduce<FieldErrors<I>>((acc, detail) => {
            const fn = ApiClientFieldErrorCodes.getAttribute(detail.code, "message");
            return {
              ...acc,
              [detail.field as FieldName<I>]: [
                ...(acc[detail.field as FieldName<I>] ?? []),
                detail.message ?? fn(detail.field),
              ],
            };
          }, {}),
        );
      }
      /* We might want to fine tune this if we ever have to deal with the difference between a
         user facing and non-user facing error. */
      return setErrors(e.message);
    },
    [setErrors],
  );

  const fieldErrors = useMemo(() => {
    const keys = union(Object.keys(internalFieldErrors), Object.keys(formState.errors));
    return keys.reduce((acc, key) => {
      const k = key as FieldName<I>;
      const internal = internalFieldErrors[k] ?? [];
      const native = formState.errors[k];
      return { ...acc, [k]: native?.message ? [...internal, native.message] : internal };
    }, {});
  }, [formState.errors, internalFieldErrors]);

  return {
    formState,
    errors: globalErrors,
    fieldErrors,
    setValue,
    setValues,
    register,
    getValues,
    registerChangeHandler,
    handleApiError,
    clearErrors,
    setErrors,
    ...form,
  };
};
