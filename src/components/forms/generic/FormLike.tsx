import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { FormStructure, type FormStructureProps } from "./FormStructure";
import { type BaseFormValues } from "./types";

export * from "./types";

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
