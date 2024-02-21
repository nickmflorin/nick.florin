"use client";
import { useRef } from "react";

import clsx from "clsx";
import { type SubmitErrorHandler } from "react-hook-form";

import { FieldConditions } from "~/components/fields";
import { Field, ControlledField } from "~/components/fields/Field";
import { ButtonFooter, type ButtonFooterProps } from "~/components/structural/ButtonFooter";
import { type ComponentProps } from "~/components/types";

import { NativeForm, type NativeFormProps } from "../NativeForm";
import { type FormInstance, type BaseFormValues } from "../types";
import { useForm } from "../useForm";

import { FormErrors, type IFormErrors } from "./FormErrors";

export { type NativeFormProps } from "../NativeForm";
export * from "../types";

type SubmitAction<I extends BaseFormValues> = (data: I, errorHandler: IFormErrors) => void;

export type FormProps<I extends BaseFormValues> = ComponentProps &
  Omit<NativeFormProps, keyof ComponentProps | "action" | "onSubmit" | "submitButtonType"> &
  Omit<ButtonFooterProps, "onSubmit" | keyof ComponentProps | "orientation"> & {
    readonly form: FormInstance<I>;
    readonly contentClassName?: ComponentProps["className"];
    readonly header?: JSX.Element;
    readonly buttonsOrientation?: ButtonFooterProps["orientation"];
    readonly onSubmit?: SubmitAction<I>;
    readonly action?: SubmitAction<I>;
    readonly onError?: SubmitErrorHandler<I>;
  };

export const Form = <I extends BaseFormValues>({
  form: { handleSubmit },
  children,
  className,
  style,
  buttonsOrientation,
  header,
  contentClassName,
  action,
  onSubmit,
  onError,
  ...props
}: FormProps<I>): JSX.Element => {
  const errorHandler = useRef<IFormErrors>(null);

  if (onSubmit && action) {
    throw new Error("Both the action and submit handler cannot be simultaneously provided.");
  }
  return (
    <NativeForm
      style={style}
      className={clsx("form", className)}
      action={
        action !== undefined
          ? () => {
              handleSubmit((data: I) => {
                if (errorHandler.current) {
                  errorHandler.current.clearErrors();
                  action(data, errorHandler.current);
                }
              }, onError)();
            }
          : undefined
      }
      onSubmit={
        onSubmit !== undefined
          ? handleSubmit(data => {
              if (errorHandler.current) {
                errorHandler.current.clearErrors();
                onSubmit(data, errorHandler.current);
              }
            }, onError)
          : undefined
      }
    >
      {header && <div className="form__header">{header}</div>}
      <div className={clsx("form__content", contentClassName)}>{children}</div>
      <div className="form__footer">
        <FormErrors handler={errorHandler} />
        {(onSubmit || action || props.onCancel) && (
          <ButtonFooter {...props} orientation={buttonsOrientation} />
        )}
      </div>
    </NativeForm>
  );
};

Form.Native = NativeForm;
Form.Field = Field;
Form.ControlledField = ControlledField;
Form.FieldCondition = FieldConditions;
Form.useForm = useForm;

export default Form;
