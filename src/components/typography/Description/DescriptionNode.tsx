import { type ForwardedRef, type JSX, type ComponentProps as ReactComponentProps } from 'react';

import { isFragment } from 'react-is';

import {
  classNames,
  type ComponentProps,
  getTypographyClassName,
  getTypographyStyle,
  omitTypographyProps,
  parseDataAttributes,
  type TypographyCharacteristics,
} from '~/components/types';

export type DescriptionComponent = 'div' | 'p' | 'span';

type PolymorphicDescriptionProps<T extends DescriptionComponent> = Omit<
  ReactComponentProps<T>,
  'ref' | keyof ComponentProps
>;

type PolymorphicDescriptionRef<T extends DescriptionComponent> = {
  div: ForwardedRef<HTMLDivElement>;
  p: ForwardedRef<HTMLParagraphElement>;
  span: ForwardedRef<HTMLSpanElement>;
}[T];

export type DescriptionNodeProps<C extends DescriptionComponent> = {
  readonly component?: DescriptionComponent;
  readonly isInherited?: boolean;
} & ComponentProps &
  PolymorphicDescriptionProps<C> &
  TypographyCharacteristics;

export const DescriptionNode = <C extends DescriptionComponent>({
  component = 'div',
  isInherited = false,
  ref,
  ...props
}: {
  readonly ref?: PolymorphicDescriptionRef<C>;
} & DescriptionNodeProps<C>): JSX.Element | null => {
  if (
    isFragment(props.children) ||
    props.children === undefined ||
    typeof props.children === 'boolean' ||
    (typeof props.children === 'string' && props.children.trim() === '')
  ) {
    return null;
  }
  const ps = {
    ...omitTypographyProps(props),
    ...parseDataAttributes({ inherit: isInherited }),
    className: classNames(
      'description',
      getTypographyClassName(props),
      {
        [classNames('max-sm:text-xs', props.className)]: props.fontSize === undefined,
        [classNames('text-sm', props.className)]: props.fontSize === undefined,
      },
      props.className,
    ),
    style: { ...getTypographyStyle(props), ...props.style },
  };
  switch (component) {
    case 'div': {
      const p = ps as ReactComponentProps<'div'>;
      return <div {...p} ref={ref as PolymorphicDescriptionRef<'div'>} />;
    }
    case 'p': {
      const p = ps as ReactComponentProps<'p'>;
      return <p {...p} ref={ref as PolymorphicDescriptionRef<'p'>} />;
    }
    case 'span': {
      const p = ps as ReactComponentProps<'span'>;
      return <span {...p} ref={ref} />;
    }
  }
};
