import { type JSX, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

import { FormErrors } from './FormErrors';
import { type BaseFormValues, type FormInstance } from './types';

export interface FormFooterProps<I extends BaseFormValues> extends ComponentProps {
  readonly children?: ReactNode;
  readonly footer?: JSX.Element;
  readonly form: FormInstance<I>;
  readonly isScrollable?: boolean;
}

export const FormFooter = <I extends BaseFormValues>({
  footer,
  form,
  isScrollable = true,
  ...props
}: FormFooterProps<I>) => (
  <>
    {form.errors.length !== 0 || footer ? (
      <div
        {...props}
        className={classNames(
          'flex flex-col mt-[16px]',
          { 'pr-[18px]': isScrollable },
          props.className,
        )}
      >
        <FormErrors className='my-[4px]' form={form} />
        {footer}
      </div>
    ) : null}
  </>
);
