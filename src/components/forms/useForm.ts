import { useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm as useReactHookForm,
  type Path,
  type PathValue,
  type UseFormRegisterReturn,
  type RegisterOptions,
} from "react-hook-form";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldName,
  type FormConfig,
  type ControlledFieldChangeHandler,
} from "./types";

export const useForm = <I extends BaseFormValues, IN = I>({
  schema,
  onChange,
  ...options
}: FormConfig<I, IN>): FormInstance<I> => {
  const {
    setValue,
    getValues,
    register: _register,
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

  return { setValue, setValues, register, getValues, registerChangeHandler, ...form };
};
