import { type JSX, type ReactNode } from 'react';

import { Loading } from '~/components/loading/Loading';
import { classNames, type ComponentProps } from '~/components/types';
import { Title } from '~/components/typography';

import { FormErrors } from './FormErrors';
import { type BaseFormValues, type FormInstance } from './types';

export { type NativeFormProps } from './NativeForm';
export * from './types';

export type FormStructureProps<I extends BaseFormValues> = {
  readonly children?: ReactNode;
  readonly contentClassName?: ComponentProps['className'];
  readonly footer?: JSX.Element;
  readonly footerClassName?: ComponentProps['className'];
  readonly form: FormInstance<I>;
  readonly isLoading?: boolean;
  readonly isScrollable?: boolean;
  readonly structure?: (params: {
    body?: JSX.Element;
    footer: JSX.Element;
    header: JSX.Element;
  }) => JSX.Element;
  readonly title?: JSX.Element | JSX.Element[] | string;
};

const Header = <I extends BaseFormValues>({ title }: Pick<FormStructureProps<I>, 'title'>) => (
  <>
    {typeof title === 'string' ? (
      <Title className='mb-4' component='h4'>
        {title}
      </Title>
    ) : title ? (
      <div className='flex flex-col mb-4'>{title}</div>
    ) : null}
  </>
);

const Body = <I extends BaseFormValues>({
  children,
  contentClassName,
  isLoading = false,
  isScrollable = true,
}: Pick<FormStructureProps<I>, 'children' | 'contentClassName' | 'isLoading' | 'isScrollable'>) => (
  <div
    className={classNames('flex flex-col grow relative', {
      'overflow-y-auto pr-[18px]': isScrollable,
    })}
  >
    <Loading isLoading={isLoading}>
      <div className={classNames('flex flex-col gap-[8px]', contentClassName)}>{children}</div>
    </Loading>
  </div>
);

const Footer = <I extends BaseFormValues>({
  footer,
  footerClassName,
  form,
  isScrollable = true,
}: Pick<FormStructureProps<I>, 'footer' | 'footerClassName' | 'form' | 'isScrollable'>) => (
  <>
    {(form.errors.length !== 0 || footer) && (
      <div
        className={classNames(
          'flex flex-col mt-[16px]',
          { 'pr-[18px]': isScrollable },
          footerClassName,
        )}
      >
        <FormErrors className='my-[4px]' form={form} />
        {footer}
      </div>
    )}
  </>
);

export const FormStructure = <I extends BaseFormValues>({
  children,
  contentClassName,
  footer,
  footerClassName,
  form,
  isLoading,
  isScrollable = true,
  structure,
  title,
}: FormStructureProps<I>) =>
  structure ? (
    structure({
      body: children ? (
        <Body contentClassName={contentClassName} isLoading={isLoading} isScrollable={isScrollable}>
          {children}
        </Body>
      ) : undefined,
      footer: (
        <Footer
          footer={footer}
          footerClassName={footerClassName}
          form={form}
          isScrollable={isScrollable}
        />
      ),
      header: <Header title={title} />,
    })
  ) : (
    <>
      <Header title={title} />
      <Body contentClassName={contentClassName} isLoading={isLoading} isScrollable={isScrollable}>
        {children}
      </Body>
      <Footer
        footer={footer}
        footerClassName={footerClassName}
        form={form}
        isScrollable={isScrollable}
      />
    </>
  );
