import clsx from "clsx";
import { type SubmitErrorHandler } from "react-hook-form";

import { type ComponentProps } from "~/components/types";

import { FormField, ControlledField } from "./Field";
import { FormStructure, type FormStructureProps } from "./FormStructure";
import { NativeForm, type NativeFormProps } from "./NativeForm";
import { type FormInstance, type BaseFormValues, FieldConditions } from "./types";

export { type NativeFormProps } from "./NativeForm";
export * from "./types";

type SubmitAction<I extends BaseFormValues> = (data: I, form: FormInstance<I>) => void;

export interface FormProps<I extends BaseFormValues>
  extends ComponentProps,
    Omit<NativeFormProps, keyof ComponentProps | "action" | "onSubmit" | "submitButtonType">,
    FormStructureProps<I> {
  readonly onSubmit?: SubmitAction<I>;
  readonly action?: SubmitAction<I>;
  readonly onError?: SubmitErrorHandler<I>;
}

export const Form = <I extends BaseFormValues>({
  form,
  children,
  className,
  style,
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
      <FormStructure {...props} form={form}>
        {children}
      </FormStructure>
    </NativeForm>
  );
};

Form.Native = NativeForm;
Form.Field = FormField;
Form.ControlledField = ControlledField;
Form.FieldCondition = FieldConditions;

export default Form;
