import { type JSX, useMemo } from "react";

import clsx from "clsx";
import { Controller, type ControllerRenderProps } from "react-hook-form";

import { ensuresDefinedValue } from "~/lib/typeguards";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
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

type _BaseFieldProps<T> = T &
  ComponentProps & {
    readonly children: JSX.Element | JSX.Element[];
    readonly label?: string;
    readonly condition?: FieldCondition;
    readonly description?: string;
    readonly helpText?: string;
    readonly helpTextClassName?: ComponentProps["className"];
  };

type _FormFieldProps<N extends FieldName<I>, I extends BaseFormValues> = _BaseFieldProps<{
  readonly form: FormInstance<I>;
  readonly name: N;
  readonly errors?: never;
}>;

type _GenericFieldProps = _BaseFieldProps<{
  readonly errors?: FieldError[];
  readonly form?: never;
  readonly name?: never;
}>;

type _FieldProps<N extends FieldName<I>, I extends BaseFormValues> =
  | _GenericFieldProps
  | _FormFieldProps<N, I>;

const _isControlFieldProps = <N extends FieldName<I>, I extends BaseFormValues>(
  props: _FieldProps<N, I>,
): props is _FormFieldProps<N, I> => (props as _FormFieldProps<N, I>).name !== undefined;

const _Field = <N extends FieldName<I>, I extends BaseFormValues>(
  props: _FieldProps<N, I>,
): JSX.Element => {
  let fieldErrors: FieldErrors<I> | undefined = undefined;
  const { children, name, errors: _errors } = props;
  if (_isControlFieldProps(props)) {
    ({
      form: { fieldErrors },
    } = props);
  }
  const errors = useMemo(() => {
    const _name = ensuresDefinedValue(Array.isArray(name) ? name[0] : name);
    if (fieldErrors) {
      return fieldErrors?.[_name as keyof FieldErrors<I>] ?? [];
    }
    return _errors;
  }, [_errors, fieldErrors, name]);

  return (
    <div style={props.style} className={clsx("flex flex-col w-full", props.className)}>
      {(props.condition !== undefined || props.label !== undefined) && (
        <div className="w-full mb-[4px] flex h-[20px]">
          {props.label && (
            <Label size="sm" fontWeight="medium" className="text-gray-700 leading-[20px]">
              {props.label}
            </Label>
          )}
          {props.condition && <FieldConditionText condition={props.condition} />}
        </div>
      )}
      {props.description !== undefined && (
        <Text size="xs" className="text-gray-500 leading-[16px] mb-[6px]">
          {props.description}
        </Text>
      )}
      <div className="form-field-content">{children}</div>
      {props.helpText !== undefined && (
        <Text
          size="xs"
          className={clsx(
            "leading-[14px] text-gray-500 pl-[1px] mt-[4px]",
            props.helpTextClassName,
          )}
        >
          {props.helpText}
        </Text>
      )}
      {errors && <FormFieldErrors errors={errors} className="mt-[4px]" />}
    </div>
  );
};

export type FormFieldProps<N extends FieldName<I>, I extends BaseFormValues> = Omit<
  _FormFieldProps<N, I>,
  "_className"
>;

export type ControlledFieldProps<N extends FieldName<I>, I extends BaseFormValues> = Omit<
  FormFieldProps<N, I>,
  "children"
> & {
  readonly children: (params: ControllerRenderProps<I, N>) => JSX.Element;
};

const _ControlledField = <N extends FieldName<I>, I extends BaseFormValues>({
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

export const Field = _Field as {
  (props: _GenericFieldProps): JSX.Element;
  <N extends FieldName<I>, I extends BaseFormValues>(props: FormFieldProps<N, I>): JSX.Element;
};

export const ControlledField = _ControlledField as {
  <N extends FieldName<I>, I extends BaseFormValues>(
    props: ControlledFieldProps<N, I>,
  ): JSX.Element;
};
