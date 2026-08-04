import { type JSX } from 'react';

import { Controller, type ControllerRenderProps } from 'react-hook-form';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';
import { Description, Label, type LabelProps, Text } from '~/components/typography';
import { ShowHide } from '~/components/util';

import {
  type BaseFormValues,
  type FieldCondition,
  FieldConditions,
  type FieldError,
  type FieldName,
  type FormInstance,
} from '../types';

import { FormFieldErrors } from './FieldErrors';

const ConditionLabels: Record<FieldCondition, string> = {
  [FieldConditions.OPTIONAL]: 'optional',
  [FieldConditions.REQUIRED]: 'required',
};

const FieldConditionText = ({ condition }: { readonly condition: FieldCondition }): JSX.Element => (
  <div className='flex grow justify-end'>
    <Text className='text-gray-700 leading-[20px] mr-[1px]' fontSize='sm'>
      (
    </Text>
    <Text className='text-gray-600 leading-[20px]' fontSize='sm'>
      {ConditionLabels[condition]}
    </Text>
    <Text className='text-gray-700 ml-[1px] leading-[20px]' fontSize='sm'>
      )
    </Text>
  </div>
);

type BaseAbstractFieldProps<T> = {
  readonly autoRenderErrors?: boolean;
  readonly children: JSX.Element | JSX.Element[];
  readonly condition?: FieldCondition;
  readonly description?: string;
  readonly descriptionClassName?: ComponentProps['className'];
  readonly descriptionSeparation?: QuantitativeSize<'px'>;
  readonly errorSeparation?: QuantitativeSize<'px'>;
  readonly helpText?: string;
  readonly helpTextClassName?: ComponentProps['className'];
  readonly helpTextSeparation?: QuantitativeSize<'px'>;
  readonly label?: string;
  readonly labelClassName?: ComponentProps['className'];
  readonly labelProps?: Omit<LabelProps<'label'>, 'children' | keyof ComponentProps>;
  readonly labelSeparation?: QuantitativeSize<'px'>;
} & ComponentProps &
  T;

type ConnectedAbstractFieldProps<
  N extends FieldName<I>,
  I extends BaseFormValues,
> = BaseAbstractFieldProps<{
  readonly errors?: never;
  readonly form: FormInstance<I>;
  readonly name: N;
}>;

type UnconnectedAbstractFieldProps = BaseAbstractFieldProps<{
  readonly errors?: FieldError[];
  readonly form?: never;
  readonly name?: never;
}>;

export type FieldProps<N extends FieldName<I>, I extends BaseFormValues> =
  ConnectedAbstractFieldProps<N, I> | UnconnectedAbstractFieldProps;

export const Field = <N extends FieldName<I>, I extends BaseFormValues>({
  autoRenderErrors = true,
  children,
  condition,
  description,
  descriptionSeparation = '8px',
  errors: _errors = [],
  errorSeparation = '6px',
  form,
  helpText,
  helpTextClassName,
  helpTextSeparation = '4px',
  label,
  labelClassName,
  labelProps,
  labelSeparation = '6px',
  name,
  ...props
}: FieldProps<N, I>): JSX.Element => (
  <div {...props} className={classNames('flex flex-col w-full', props.className)}>
    {condition !== undefined || label !== undefined ? (
      <div
        className='w-full flex h-[20px]'
        style={{ marginBottom: sizeToString(labelSeparation, 'px') }}
      >
        {label ? (
          <Label fontSize='sm' fontWeight='medium' {...labelProps} className={labelClassName}>
            {label}
          </Label>
        ) : null}
        {condition ? <FieldConditionText condition={condition} /> : null}
      </div>
    ) : null}
    {description === undefined ? null : (
      <Description
        className={classNames('leading-[14px] text-gray-500 pl-[1px]', helpTextClassName)}
        fontSize='xs'
        style={{ marginBottom: sizeToString(descriptionSeparation, 'px') }}
      >
        {description}
      </Description>
    )}
    <div className='form-field-content'>{children}</div>
    {helpText === undefined ? null : (
      <Text
        className={classNames('leading-[14px] text-gray-500 pl-[1px]', helpTextClassName)}
        fontSize='xs'
        style={{ marginTop: sizeToString(helpTextSeparation, 'px') }}
      >
        {helpText}
      </Text>
    )}
    <ShowHide show={autoRenderErrors}>
      {form ? (
        <FormFieldErrors
          form={form}
          name={name}
          style={{ marginTop: sizeToString(errorSeparation, 'px') }}
        />
      ) : (
        <FormFieldErrors
          errors={_errors}
          style={{ marginTop: sizeToString(errorSeparation, 'px') }}
        />
      )}
    </ShowHide>
  </div>
);

export type ControlledFieldProps<N extends FieldName<I>, I extends BaseFormValues> = {
  readonly children: (params: ControllerRenderProps<I, N>) => JSX.Element;
} & Omit<ConnectedAbstractFieldProps<N, I>, 'children'>;

export const ControlledField = <N extends FieldName<I>, I extends BaseFormValues>({
  children,
  ...props
}: ControlledFieldProps<N, I>): JSX.Element => (
  <Field<N, I> {...props}>
    <Controller
      control={props.form.control}
      name={props.name}
      render={({ field }) =>
        children({
          ...field,
          onChange: props.form.registerChangeHandler(props.name, field.onChange),
        })
      }
    />
  </Field>
);

export type FormFieldProps<
  N extends FieldName<I>,
  I extends BaseFormValues,
> = ConnectedAbstractFieldProps<N, I>;

export const FormField = <N extends FieldName<I>, I extends BaseFormValues>(
  props: FormFieldProps<N, I>,
): JSX.Element => <Field<N, I> {...props} />;

export type GenericFieldProps = UnconnectedAbstractFieldProps;

export const GenericField = (props: GenericFieldProps): JSX.Element => <Field {...props} />;
