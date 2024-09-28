import { type JSX } from "react";

import { Controller, type ControllerRenderProps } from "react-hook-form";

import {
  type ComponentProps,
  type QuantitativeSize,
  classNames,
  sizeToString,
} from "~/components/types";
import { Text, Description, Label, type LabelProps } from "~/components/typography";
import { ShowHide } from "~/components/util";

import {
  type FormInstance,
  type BaseFormValues,
  type FieldError,
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
    <Text fontSize="sm" className="text-gray-700 leading-[20px] mr-[1px]">
      (
    </Text>
    <Text fontSize="sm" className="text-gray-600 leading-[20px]">
      {ConditionLabels[condition]}
    </Text>
    <Text fontSize="sm" className="text-gray-700 ml-[1px] leading-[20px]">
      )
    </Text>
  </div>
);

type BaseAbstractFieldProps<T> = T &
  ComponentProps & {
    readonly children: JSX.Element | JSX.Element[];
    readonly label?: string;
    readonly autoRenderErrors?: boolean;
    readonly condition?: FieldCondition;
    readonly labelSeparation?: QuantitativeSize<"px">;
    readonly errorSeparation?: QuantitativeSize<"px">;
    readonly description?: string;
    readonly descriptionSeparation?: QuantitativeSize<"px">;
    readonly descriptionClassName?: ComponentProps["className"];
    readonly helpText?: string;
    readonly helpTextSeparation?: QuantitativeSize<"px">;
    readonly helpTextClassName?: ComponentProps["className"];
    readonly labelProps?: Omit<LabelProps<"label">, "children" | keyof ComponentProps>;
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
  errors: _errors = [],
  autoRenderErrors = true,
  labelSeparation = "6px",
  helpTextSeparation = "4px",
  descriptionSeparation = "8px",
  errorSeparation = "6px",
  labelClassName,
  labelProps,
  condition,
  description,
  helpText,
  helpTextClassName,
  ...props
}: FieldProps<N, I>): JSX.Element => (
  <div {...props} className={classNames("flex flex-col w-full", props.className)}>
    {(condition !== undefined || label !== undefined) && (
      <div
        className="w-full flex h-[20px]"
        style={{ marginBottom: sizeToString(labelSeparation, "px") }}
      >
        {label && (
          <Label fontSize="sm" fontWeight="medium" {...labelProps} className={labelClassName}>
            {label}
          </Label>
        )}
        {condition && <FieldConditionText condition={condition} />}
      </div>
    )}
    {description !== undefined && (
      <Description
        fontSize="xs"
        className={classNames("leading-[14px] text-gray-500 pl-[1px]", helpTextClassName)}
        style={{ marginBottom: sizeToString(descriptionSeparation, "px") }}
      >
        {description}
      </Description>
    )}
    <div className="form-field-content">{children}</div>
    {helpText !== undefined && (
      <Text
        fontSize="xs"
        className={classNames("leading-[14px] text-gray-500 pl-[1px]", helpTextClassName)}
        style={{ marginTop: sizeToString(helpTextSeparation, "px") }}
      >
        {helpText}
      </Text>
    )}
    <ShowHide show={autoRenderErrors}>
      {form ? (
        <FormFieldErrors
          form={form}
          name={name}
          style={{ marginTop: sizeToString(errorSeparation, "px") }}
        />
      ) : (
        <FormFieldErrors
          errors={_errors}
          style={{ marginTop: sizeToString(errorSeparation, "px") }}
        />
      )}
    </ShowHide>
  </div>
);

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

export type GenericFieldProps = UnconnectedAbstractFieldProps;

export const GenericField = (props: GenericFieldProps): JSX.Element => <Field {...props} />;
