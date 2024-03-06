import { type JSX, useMemo } from "react";

import clsx from "clsx";
import { Controller, type ControllerRenderProps } from "react-hook-form";

import { ensuresDefinedValue } from "~/lib/typeguards";
import { type ComponentProps } from "~/components/types";
import { Label, type LabelProps } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldError,
  type FieldErrors,
  FieldConditions,
  type FieldCondition,
  type FieldName,
} from "../types";

import { FormFieldErrors } from "./FieldErrors";

const ConditionLabels: { [key in FieldCondition]: string } = {
  [FieldConditions.OPTIONAL]: "optional",
  [FieldConditions.REQUIRED]: "required",
};

const FieldConditionText = ({ condition }: { condition: FieldCondition }): JSX.Element => (
  <div className="flex grow justify-end">
    <Text size="sm" className="text-gray-700 leading-[20px] mr-[1px]">
      (
    </Text>
    <Text size="sm" className="text-gray-600 leading-[20px]">
      {ConditionLabels[condition]}
    </Text>
    <Text size="sm" className="text-gray-700 ml-[1px] leading-[20px]">
      )
    </Text>
  </div>
);

type BaseAbstractFieldProps<T> = T &
  ComponentProps & {
    readonly children: JSX.Element | JSX.Element[];
    readonly label?: string;
    readonly condition?: FieldCondition;
    readonly description?: string;
    readonly helpText?: string;
    readonly helpTextClassName?: ComponentProps["className"];
    readonly labelProps?: Omit<LabelProps, "children" | keyof ComponentProps>;
    readonly labelClassName?: ComponentProps["className"];
  };

type ConnectedAbstractFieldProps<
  N extends FieldName<I>,
  I extends BaseFormValues,
> = BaseAbstractFieldProps<{
  readonly form: FormInstance<I>;
  readonly name: N;
  readonly errors?: never;
}>;

type UnconnectedAbstractFieldProps = BaseAbstractFieldProps<{
  readonly errors?: FieldError[];
  readonly form?: never;
  readonly name?: never;
}>;

export type FieldProps<N extends FieldName<I>, I extends BaseFormValues> =
  | UnconnectedAbstractFieldProps
  | ConnectedAbstractFieldProps<N, I>;

export const Field = <N extends FieldName<I>, I extends BaseFormValues>({
  children,
  name,
  label,
  form,
  errors: _errors,
  labelClassName = "text-gray-700 leading-[20px]",
  labelProps,
  condition,
  description,
  helpText,
  helpTextClassName,
  ...props
}: FieldProps<N, I>): JSX.Element => {
  const fieldErrors = useMemo(() => (form ? form.fieldErrors : undefined), [form]);

  const errors = useMemo(() => {
    const _name = ensuresDefinedValue(Array.isArray(name) ? name[0] : name);
    if (fieldErrors) {
      return fieldErrors?.[_name as keyof FieldErrors<I>] ?? [];
    }
    return _errors;
  }, [_errors, name, fieldErrors]);

  return (
    <div {...props} className={clsx("flex flex-col w-full", props.className)}>
      {(condition !== undefined || label !== undefined) && (
        <div className="w-full mb-[4px] flex h-[20px]">
          {label && (
            <Label size="sm" fontWeight="medium" {...labelProps} className={labelClassName}>
              {label}
            </Label>
          )}
          {condition && <FieldConditionText condition={condition} />}
        </div>
      )}
      {description !== undefined && (
        <Text size="xs" className="text-gray-500 leading-[16px] mb-[6px]">
          {description}
        </Text>
      )}
      <div className="form-field-content">{children}</div>
      {helpText !== undefined && (
        <Text
          size="xs"
          className={clsx("leading-[14px] text-gray-500 pl-[1px] mt-[4px]", helpTextClassName)}
        >
          {helpText}
        </Text>
      )}
      {errors && <FormFieldErrors errors={errors} className="mt-[4px]" />}
    </div>
  );
};

export type ControlledFieldProps<N extends FieldName<I>, I extends BaseFormValues> = Omit<
  ConnectedAbstractFieldProps<N, I>,
  "children"
> & {
  readonly children: (params: ControllerRenderProps<I, N>) => JSX.Element;
};

export const ControlledField = <N extends FieldName<I>, I extends BaseFormValues>({
  children,
  ...props
}: ControlledFieldProps<N, I>): JSX.Element => (
  <Field<N, I> {...props}>
    <Controller
      control={props.form.control}
      name={props.name}
      render={({ field }) =>
        children({
          ...field,
          onChange: props.form.registerChangeHandler(props.name, field.onChange),
        })
      }
    />
  </Field>
);

export type FormFieldProps<
  N extends FieldName<I>,
  I extends BaseFormValues,
> = ConnectedAbstractFieldProps<N, I>;

export const FormField = <N extends FieldName<I>, I extends BaseFormValues>(
  props: FormFieldProps<N, I>,
): JSX.Element => <Field<N, I> {...props} />;
