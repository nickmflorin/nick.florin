import { type SubmitErrorHandler } from "react-hook-form";

import { type ComponentProps, classNames } from "~/components/types";

import { FormField, ControlledField, GenericField } from "./Field";
import { FormBody, type FormBodyProps } from "./FormBody";
import { FormFooter, type FormFooterProps } from "./FormFooter";
import { FormHeader, type FormHeaderProps } from "./FormHeader";
import { NativeForm, type NativeFormProps } from "./NativeForm";
import { type FormInstance, type BaseFormValues, FieldConditions } from "./types";

export { type NativeFormProps } from "./NativeForm";
export * from "./types";

type SubmitAction<I extends BaseFormValues> = (data: I, form: FormInstance<I>) => void;

export interface FormProps<I extends BaseFormValues>
  extends ComponentProps,
    Omit<
      NativeFormProps,
      keyof ComponentProps | "action" | "onSubmit" | "submitButtonType" | "children"
    >,
    FormBodyProps,
    FormFooterProps<I>,
    FormHeaderProps {
  readonly footerClassName?: ComponentProps["className"];
  readonly onSubmit?: SubmitAction<I>;
  readonly action?: SubmitAction<I>;
  readonly onError?: SubmitErrorHandler<I>;
}

export const Form = <I extends BaseFormValues>({
  form,
  children,
  title,
  footer,
  footerClassName,
  isLoading,
  isScrollable,
  isDisabled,
  contentClassName,
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
      className={classNames("form", props.className)}
      action={
        action !== undefined
          ? () => {
              form.handleSubmit((data: I) => {
                action(data, form);
              }, onError)();
            }
          : undefined
      }
      onSubmit={
        onSubmit !== undefined
          ? form.handleSubmit(data => {
              onSubmit(data, form);
            }, onError)
          : undefined
      }
    >
      <FormHeader title={title} />
      <FormBody
        isLoading={isLoading}
        isScrollable={isScrollable}
        contentClassName={contentClassName}
        isDisabled={isDisabled}
      >
        {children}
      </FormBody>
      <FormFooter
        footer={footer}
        className={footerClassName}
        isScrollable={isScrollable}
        form={form}
      />
    </NativeForm>
  );
};

Form.Native = NativeForm;
Form.Field = FormField;
Form.ControlledField = ControlledField;
Form.FieldCondition = FieldConditions;
Form.GenericField = GenericField;

export default Form;
