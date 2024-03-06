import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type BaseFormValues } from "../types";

import { FormStructure, type FormStructureProps } from "./FormStructure";

export { type NativeFormProps } from "../NativeForm";
export * from "../types";

export interface FormLikeProps<I extends BaseFormValues>
  extends ComponentProps,
    FormStructureProps<I> {}

export const FormLike = <I extends BaseFormValues>({
  form,
  children,
  className,
  style,
  ...props
}: FormLikeProps<I>): JSX.Element => (
  <div style={style} className={clsx("form", { "pr-[18px]": props.isScrollable }, className)}>
    <FormStructure {...props} form={form}>
      {children}
    </FormStructure>
  </div>
);

export default FormLike;
