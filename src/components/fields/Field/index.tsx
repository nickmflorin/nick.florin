import { type JSX, useMemo } from "react";

import clsx from "clsx";
import {
  Controller,
  type FieldErrors,
  type ControllerRenderProps,
  type FieldPath,
} from "react-hook-form";

import { ensuresDefinedValue } from "~/lib/typeguards";
import { FieldConditions, type FieldCondition } from "~/components/fields";
import { type FormInstance, type BaseFormValues, type FieldError } from "~/components/forms";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";
import { Text } from "~/components/typography/Text";

import { FormFieldErrors } from "./FieldErrors";

const ConditionLabels: { [key in FieldCondition]: string } = {
  [FieldConditions.OPTIONAL]: "optional",
  [FieldConditions.REQUIRED]: "required",
};

const FieldConditionText = ({ condition }: { condition: FieldCondition }): JSX.Element => (
  <div className="form-field__condition">
    <Text className="text-gray-700" style={{ marginRight: 1 }}>
      (
    </Text>
    <Text className="text-gray-600">{ConditionLabels[condition]}</Text>
    <Text className="text-gray-700 ml-[1px]">)</Text>
  </div>
);

type _BaseFieldProps<T> = T &
  ComponentProps & {
    readonly children: JSX.Element | JSX.Element[];
    readonly label?: string;
    readonly condition?: FieldCondition;
    readonly description?: string;
    readonly _className?: string;
  };

type _FormFieldProps<
  K extends FieldPath<I>,
  I extends BaseFormValues,
  _N extends K | K[],
> = _BaseFieldProps<{
  readonly form: FormInstance<I>;
  readonly name: _N;
  readonly errors?: never;
}>;

type _GenericFieldProps = _BaseFieldProps<{
  readonly errors?: FieldError[];
  readonly form?: never;
  readonly name?: never;
}>;

type _FieldProps<K extends FieldPath<I>, I extends BaseFormValues, _N extends K | K[]> =
  | _GenericFieldProps
  | _FormFieldProps<K, I, _N>;

const _isControlFieldProps = <K extends FieldPath<I>, I extends BaseFormValues, _N extends K | K[]>(
  props: _FieldProps<K, I, _N>,
): props is _FormFieldProps<K, I, _N> => (props as _FormFieldProps<K, I, _N>).name !== undefined;

const _Field = <K extends FieldPath<I>, I extends BaseFormValues, _N extends K | K[]>(
  props: _FieldProps<K, I, _N>,
): JSX.Element => {
  let formErrors: FieldErrors<I> | undefined = undefined;
  const { children, name, errors: _errors, _className = "form-field" } = props;
  if (_isControlFieldProps(props)) {
    ({
      form: {
        formState: { errors: formErrors },
      },
    } = props);
  }
  const errors = useMemo(() => {
    const _name = ensuresDefinedValue(Array.isArray(name) ? name[0] : name);
    if (formErrors) {
      const errs = formErrors[_name as keyof FieldErrors<I>];
      if (errs !== undefined && errs.message !== undefined) {
        return [errs.message.toString()];
      }
      return [];
    }
    return _errors;
  }, [_errors, formErrors, name]);

  return (
    <div style={props.style} className={clsx(_className, props.className)}>
      {(props.condition !== undefined || props.label !== undefined) && (
        <div className="form-field__header">
          {props.label && <Label className="form-field__label">{props.label}</Label>}
          {props.condition && <FieldConditionText condition={props.condition} />}
        </div>
      )}
      {props.description !== undefined && (
        <Text className="form-field__description">{props.description}</Text>
      )}
      <div className="form-field-content">{children}</div>
      {errors && <FormFieldErrors errors={errors} />}
    </div>
  );
};

export type FormFieldProps<K extends FieldPath<I>, I extends BaseFormValues> = Omit<
  _FormFieldProps<K, I, K>,
  "_className"
>;

export type ControlledFieldProps<K extends FieldPath<I>, I extends BaseFormValues> = Omit<
  FormFieldProps<K, I>,
  "children"
> & {
  readonly children: (params: ControllerRenderProps<I, K>) => JSX.Element;
};

const _ControlledField = <K extends FieldPath<I>, I extends BaseFormValues>({
  children,
  ...props
}: ControlledFieldProps<K, I>): JSX.Element => (
  <Field<K, I> {...props}>
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
  <K extends FieldPath<I>, I extends BaseFormValues>(props: FormFieldProps<K, I>): JSX.Element;
};

export const ControlledField = _ControlledField as {
  <K extends FieldPath<I>, I extends BaseFormValues>(
    props: ControlledFieldProps<K, I>,
  ): JSX.Element;
};
