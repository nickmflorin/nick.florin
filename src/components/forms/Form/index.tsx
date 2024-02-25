import clsx from "clsx";
import { type SubmitErrorHandler } from "react-hook-form";

import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import { Loading } from "~/components/views/Loading";

import { Field, ControlledField } from "../Field";
import { NativeForm, type NativeFormProps } from "../NativeForm";
import { type FormInstance, type BaseFormValues, FieldConditions } from "../types";

import { FormErrors } from "./FormErrors";

export { type NativeFormProps } from "../NativeForm";
export * from "../types";

type SubmitAction<I extends BaseFormValues> = (data: I, form: FormInstance<I>) => void;

export type FormProps<I extends BaseFormValues> = ComponentProps &
  Omit<NativeFormProps, keyof ComponentProps | "action" | "onSubmit" | "submitButtonType"> & {
    readonly form: FormInstance<I>;
    readonly contentClassName?: ComponentProps["className"];
    readonly header?: JSX.Element;
    readonly footer?: JSX.Element;
    readonly title?: string;
    readonly isLoading?: boolean;
    readonly isScrollable?: boolean;
    readonly onSubmit?: SubmitAction<I>;
    readonly action?: SubmitAction<I>;
    readonly onError?: SubmitErrorHandler<I>;
  };

export const Form = <I extends BaseFormValues>({
  form,
  children,
  footer,
  header,
  contentClassName,
  isLoading,
  title,
  isScrollable = true,
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
      {...props}
      className={clsx("form", props.className)}
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
      {header ? (
        <div className="flex flex-col">{header}</div>
      ) : title ? (
        <Title order={4}>{title}</Title>
      ) : null}
      <div
        className={clsx(
          "flex flex-col grow relative",
          { "overflow-y-scroll pr-[18px]": isScrollable },
          contentClassName,
        )}
      >
        <Loading loading={isLoading}>{children}</Loading>
      </div>
      {(form.errors.length !== 0 || footer) && (
        <div className={clsx("flex flex-col", { "pr-[18px]": isScrollable })}>
          <FormErrors form={form} className="my-[4px]" />
          {footer}
        </div>
      )}
    </NativeForm>
  );
};

Form.Native = NativeForm;
Form.Field = Field;
Form.ControlledField = ControlledField;
Form.FieldCondition = FieldConditions;

export default Form;
