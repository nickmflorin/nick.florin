import { type ForwardedRef, type JSX, type ComponentProps as ReactComponentProps } from 'react';

import { UnreachableCaseError } from '~/application/errors';

import {
  type AnyTypographyComponent,
  classNames,
  type ComponentProps,
  getTypographyClassName,
  getTypographyStyle,
  omitTypographyProps,
  type TypographyCharacteristics,
  type TypographyRef,
} from '~/components/types';

export type BaseTypographyProps<C extends AnyTypographyComponent> = {
  readonly component: C;
} & ComponentProps &
  Omit<ReactComponentProps<C>, 'ref' | keyof ComponentProps | keyof TypographyCharacteristics> &
  TypographyCharacteristics;

/**
 * An abstract typography component that is not meant to be used directly, but rather as a base
 * for other typography components to extend from.
 */
export const BaseTypography = <C extends AnyTypographyComponent>({
  component,
  ref,
  ...props
}: { readonly ref?: TypographyRef<C> } & BaseTypographyProps<C>): JSX.Element => {
  const ps = {
    ...omitTypographyProps(props),
    className: classNames(getTypographyClassName(props), props.className),
    style: { ...getTypographyStyle(props), ...props.style },
  };
  switch (component) {
    case 'div':
      return (
        <div {...(ps as ReactComponentProps<'div'>)} ref={ref as ForwardedRef<HTMLDivElement>} />
      );
    case 'h1': {
      const { children, ...rest } = ps as ReactComponentProps<'h1'>;
      return (
        <h1 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h1>
      );
    }
    case 'h2': {
      const { children, ...rest } = ps as ReactComponentProps<'h2'>;
      return (
        <h2 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h2>
      );
    }
    case 'h3': {
      const { children, ...rest } = ps as ReactComponentProps<'h3'>;
      return (
        <h3 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h3>
      );
    }
    case 'h4': {
      const { children, ...rest } = ps as ReactComponentProps<'h4'>;
      return (
        <h4 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h4>
      );
    }
    case 'h5': {
      const { children, ...rest } = ps as ReactComponentProps<'h5'>;
      return (
        <h5 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h5>
      );
    }
    case 'h6': {
      const { children, ...rest } = ps as ReactComponentProps<'h6'>;
      return (
        <h6 {...rest} ref={ref as ForwardedRef<HTMLHeadingElement>}>
          {children}
        </h6>
      );
    }
    case 'label': {
      const { children, htmlFor, ...rest } = ps as ReactComponentProps<'label'>;
      return (
        <label {...rest} htmlFor={htmlFor} ref={ref as ForwardedRef<HTMLLabelElement>}>
          {children}
        </label>
      );
    }
    case 'p':
      return (
        <p {...(ps as ReactComponentProps<'p'>)} ref={ref as ForwardedRef<HTMLParagraphElement>} />
      );
    case 'span':
      return <span {...ps} ref={ref} />;
    default:
      throw new UnreachableCaseError();
  }
};
