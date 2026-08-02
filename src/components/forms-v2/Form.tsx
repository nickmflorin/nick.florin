import { type JSX } from 'react';

import { type SubmitErrorHandler } from 'react-hook-form';

import { classNames, type ComponentProps } from '~/components/types';

import { ControlledField, FormField, GenericField } from './Field';
import { FormBody, type FormBodyProps } from './FormBody';
import { FormFooter, type FormFooterProps } from './FormFooter';
import { FormHeader, type FormHeaderProps } from './FormHeader';
import { NativeForm, type NativeFormProps } from './NativeForm';
import { type BaseFormValues, FieldConditions, type FormInstance } from './types';

export { type NativeFormProps } from './NativeForm';
export * from './types';

type SubmitAction<I extends BaseFormValues> = (data: I, form: FormInstance<I>) => void;

export interface FormProps<I extends BaseFormValues>
  extends
    ComponentProps,
    Omit<
      NativeFormProps,
      'action' | 'children' | 'onSubmit' | 'submitButtonType' | keyof ComponentProps
    >,
    FormBodyProps,
    FormFooterProps<I>,
    FormHeaderProps {
  readonly action?: SubmitAction<I>;
  readonly footerClassName?: ComponentProps['className'];
  readonly onError?: SubmitErrorHandler<I>;
  readonly onSubmit?: SubmitAction<I>;
  readonly structure?: (params: {
    body?: JSX.Element;
    footer: JSX.Element;
    header: JSX.Element;
  }) => JSX.Element;
}

export const Form = <I extends BaseFormValues>({
  action,
  children,
  contentClassName,
  footer,
  footerClassName,
  form,
  isDisabled,
  isLoading,
  isScrollable,
  onError,
  onSubmit,
  structure,
  title,
  ...props
}: FormProps<I>): JSX.Element => {
  if (onSubmit && action) {
    throw new Error('Both the action and submit handler cannot be simultaneously provided.');
  }
  return (
    <NativeForm
      {...props}
      action={
        action === undefined
          ? undefined
          : () => {
              void form.handleSubmit((data: I) => {
                action(data, form);
              }, onError)();
            }
      }
      className={classNames('form', props.className)}
      onSubmit={
        onSubmit === undefined
          ? undefined
          : form.handleSubmit(data => {
              onSubmit(data, form);
            }, onError)
      }
    >
      {structure ? (
        structure({
          body: children ? (
            <FormBody
              contentClassName={contentClassName}
              isDisabled={isDisabled}
              isLoading={isLoading}
              isScrollable={isScrollable}
            >
              {children}
            </FormBody>
          ) : undefined,
          footer: (
            <FormFooter
              className={footerClassName}
              footer={footer}
              form={form}
              isScrollable={isScrollable}
            />
          ),
          header: <FormHeader title={title} />,
        })
      ) : (
        <>
          <FormHeader title={title} />
          <FormBody
            contentClassName={contentClassName}
            isDisabled={isDisabled}
            isLoading={isLoading}
            isScrollable={isScrollable}
          >
            {children}
          </FormBody>
          <FormFooter
            className={footerClassName}
            footer={footer}
            form={form}
            isScrollable={isScrollable}
          />
        </>
      )}
    </NativeForm>
  );
};

Form.Native = NativeForm;
Form.Field = FormField;
Form.ControlledField = ControlledField;
Form.FieldCondition = FieldConditions;
Form.GenericField = GenericField;
