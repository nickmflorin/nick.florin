'use client';

import { Link, type LinkProps } from '~/components/buttons';
import { type TypographyVisibilityState } from '~/components/types';

export interface ShowMoreLinkProps extends Omit<LinkProps<'button'>, 'children' | 'options'> {
  readonly state: TypographyVisibilityState;
}

const LinkText: Record<TypographyVisibilityState, string> = {
  collapsed: 'more',
  expanded: 'less',
};

export const ShowMoreLink = ({ state, ...props }: ShowMoreLinkProps) => (
  <Link.Primary fontSize='xs' fontWeight='regular' {...props} element='button'>
    {LinkText[state]}
  </Link.Primary>
);
