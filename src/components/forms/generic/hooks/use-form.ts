import { useCallback, useMemo, useState, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import omit from "lodash.omit";
import uniq from "lodash.uniq";
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

import { humanizeList } from "~/lib/formatters";
import {
  type ApiClientError,
  type HttpError,
  ApiClientFieldErrorCodes,
  type ApiClientErrorJson,
  isApiClientFormErrorJson,
  type ApiClientFieldErrorsObj,
  isHttpError,
  ApiClientFormError,
} from "~/api";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldName,
  type FormConfig,
  type ControlledFieldChangeHandler,
  type FieldErrors,
  type SetFormErrors,
  type SetFormStaticErrors,
} from "../types";

/* TODO: We may have to revisit this.  When determining the string error message from a react hook
   form field error, the message attribute may either be a string, undefined, or another error
   object with a nested message attribute (which can recursively be either a string, undefined,
   or another error object).  The recursions are mostly due to the capability of react hook form
   to deal with nested fields - which we don't have to currently worry about, but may in the future.
   For now, we will just assume the mesage property at the top level is a string, and if it is not,
   we will return a default error message.
   Note: In the future, we may also want to investigate converting the error object's 'type' field
   into a string error message, because that will always be defined as a string, for each level of
   the recursion. */
const getReactHookFormErrorMessage = <I extends BaseFormValues>(
  errs: NativeFieldErrors[FieldName<I>],
) => (typeof errs?.message === "string" ? errs.message : "The field is invalid.");

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
      [arg1]: [...(arg0[arg1] ?? []), ...(Array.isArray(arg2) ? arg2 : [arg2])],
    };
  } else if (typeof arg1 === "string") {
    throw new TypeError("Invalid method implementation.");
  }
  return Object.keys(arg1).reduce((prev, key) => {
    const errs = arg1[key as FieldName<I>];
    if (errs !== undefined) {
      return mergeIntoFieldErrors(
        prev,
        key as FieldName<I>,
        // See docstring above the 'getReactHookFormErrorMessage' function.
        Array.isArray(errs) ? errs : getReactHookFormErrorMessage(errs),
      );
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
  const [internalStaticFieldErrors, _setInternalStaticFieldErrors] = useState<FieldErrors<I>>({});
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

  const setInternalFieldErrors = useCallback(async (fieldErrors: FieldErrors<I>) => {
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
      const logger = (await import("~/application/logger")).logger;
      logger.warn(
        "The form received field errors for fields that are not registered with the form! " +
          `Current fields registered with the form are: ${humanized}.`,
        { invalidFields, registered: registeredFields.current },
      );
    }
    _setInternalFieldErrors(fieldErrors);
  }, []);

  const setInternalStaticFieldErrors = useCallback(
    async (fieldErrors: FieldErrors<I> | ((curr: FieldErrors<I>) => FieldErrors<I>)) => {
      const logger = (await import("~/application/logger")).logger;

      const validate = (fieldErrors: FieldErrors<I>) => {
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
            "The form received static field errors for fields that are not registered with the " +
              `form! Current fields registered with the form are: ${humanized}.`,
            { invalidFields, registered: registeredFields.current },
          );
        }
      };
      if (typeof fieldErrors === "function") {
        return _setInternalStaticFieldErrors(curr => {
          validate(curr);
          return fieldErrors(curr);
        });
      }
      validate(fieldErrors);
      _setInternalStaticFieldErrors(fieldErrors);
    },
    [],
  );

  const clearErrors = useCallback(() => {
    setGlobalErrors([]);
    setInternalFieldErrors({});
    clearNativeErrors();
  }, [clearNativeErrors, setInternalFieldErrors]);

  const setStaticErrors: SetFormStaticErrors<I> = useCallback(
    (arg0: FieldName<I> | FieldErrors<I>, arg1?: string | string[]) => {
      if (arg1 && typeof arg0 === "string") {
        const fieldName = arg0 as FieldName<I>;
        return setInternalStaticFieldErrors(curr => mergeIntoFieldErrors(curr, fieldName, arg1));
      } else if (arg0 && typeof arg0 !== "string") {
        setInternalStaticFieldErrors(curr => mergeIntoFieldErrors(curr, arg0));
      } else {
        throw new TypeError("Invalid method implementation!");
      }
    },
    [setInternalStaticFieldErrors],
  );

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
    [setInternalFieldErrors],
  );

  const setInternalFieldErrorsFromResponse = useCallback(
    async (e: ApiClientError | ApiClientErrorJson, errs: ApiClientFieldErrorsObj) => {
      const logger = (await import("~/application/logger")).logger;

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
    (e: HttpError | ApiClientErrorJson) => {
      if (isHttpError(e)) {
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
    () =>
      mergeIntoFieldErrors(
        mergeIntoFieldErrors(internalStaticFieldErrors, internalFieldErrors),
        formState.errors,
      ),
    [formState.errors, internalStaticFieldErrors, internalFieldErrors],
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
    setValue,
    setValues,
    register,
    getValues,
    registerChangeHandler,
    handleApiError,
    clearErrors,
    setErrors,
    setStaticErrors,
    ...omit(form, ["setError"]),
  };
};
