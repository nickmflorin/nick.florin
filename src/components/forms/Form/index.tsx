import clsx from "clsx";
import { type SubmitErrorHandler } from "react-hook-form";

import { FieldConditions } from "~/components/fields";
import { Field, ControlledField } from "~/components/fields/Field";
import { ButtonFooter, type ButtonFooterProps } from "~/components/structural/ButtonFooter";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { NativeForm, type NativeFormProps } from "../NativeForm";
import { type FormInstance, type BaseFormValues } from "../types";

import { FormErrors } from "./FormErrors";

export { type NativeFormProps } from "../NativeForm";
export * from "../types";

type SubmitAction<I extends BaseFormValues> = (data: I, form: FormInstance<I>) => void;

export type FormProps<I extends BaseFormValues> = ComponentProps &
  Omit<NativeFormProps, keyof ComponentProps | "action" | "onSubmit" | "submitButtonType"> &
  Omit<ButtonFooterProps, "onSubmit" | keyof ComponentProps | "orientation"> & {
    readonly form: FormInstance<I>;
    readonly contentClassName?: ComponentProps["className"];
    readonly header?: JSX.Element;
    readonly isLoading?: boolean;
    readonly buttonsOrientation?: ButtonFooterProps["orientation"];
    readonly onSubmit?: SubmitAction<I>;
    readonly action?: SubmitAction<I>;
    readonly onError?: SubmitErrorHandler<I>;
  };

export const Form = <I extends BaseFormValues>({
  form,
  children,
  className,
  style,
  buttonsOrientation,
  header,
  contentClassName,
  isLoading,
  action,
  onSubmit,
  onError,
  ...props
}: FormProps<I>): JSX.Element => {
  if (onSubmit && action) {
    throw new Error("Both the action and submit handler cannot be simultaneously provided.");
  }
  return (
    <NativeForm
      style={style}
      className={clsx("form", className)}
      // action={action}
      action={
        action !== undefined
          ? () => {
              form.handleSubmit((data: I) => {
                form.clearErrors();
                action(data, form);
              }, onError)();
            }
          : undefined
      }
      onSubmit={
        onSubmit !== undefined
          ? form.handleSubmit(data => {
              form.clearErrors();
              onSubmit(data, form);
            }, onError)
          : undefined
      }
    >
      {header && <div className="form__header">{header}</div>}
      <div className={clsx("form__content", contentClassName)}>
        <Loading loading={isLoading}>{children}</Loading>
      </div>
      <div className="form__footer">
        <FormErrors form={form} />
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

export default Form;
