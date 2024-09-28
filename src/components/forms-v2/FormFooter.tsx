import { type ReactNode } from "react";

import { type ComponentProps, classNames } from "~/components/types";

import { FormErrors } from "./FormErrors";
import { type BaseFormValues, type FormInstance } from "./types";

export interface FormFooterProps<I extends BaseFormValues> extends ComponentProps {
  readonly footer?: JSX.Element;
  readonly children?: ReactNode;
  readonly form: FormInstance<I>;
  readonly isScrollable?: boolean;
}

export const FormFooter = <I extends BaseFormValues>({
  footer,
  isScrollable = true,
  form,
  ...props
}: FormFooterProps<I>) => (
  <>
    {(form.errors.length !== 0 || footer) && (
      <div
        {...props}
        className={classNames(
          "flex flex-col mt-[16px]",
          { "pr-[18px]": isScrollable },
          props.className,
        )}
      >
        <FormErrors form={form} className="my-[4px]" />
        {footer}
      </div>
    )}
  </>
);
