import { type JSX } from 'react';

import {
  DiscreteFontSizes,
  type FontSize,
  TitleFontSizeOrderMap,
  type TypographyComponent,
  type TypographyRef,
} from '~/components/types';

import { Typography, type TypographyProps } from './Typography';

export type TitleProps<C extends TypographyComponent<'title'>> = {
  readonly component?: C;
} & Omit<TypographyProps<'title', C>, 'component' | 'variant'>;

/**
 * Returns the heading element that {@link Title} should render as, defaulting the element based on
 * the provided font size when an explicit `component` is not provided.
 */
const getTitleComponent = <C extends TypographyComponent<'title'>>(
  component: C | undefined,
  fontSize: FontSize | undefined,
): TypographyComponent<'title'> => {
  if (!component && fontSize && DiscreteFontSizes.contains(fontSize)) {
    return TitleFontSizeOrderMap[fontSize];
  }
  return component ?? 'h3';
};

export const Title = <C extends TypographyComponent<'title'>>({
  component,
  ref,
  ...props
}: { readonly ref?: TypographyRef<C> } & TitleProps<C>): JSX.Element => {
  const c = getTitleComponent(component, props.fontSize);

  const ps = {
    ...props,
    component: c,
    variant: 'title',
  } as TypographyProps<'title', C>;

  return <Typography {...ps} ref={ref} />;
};
