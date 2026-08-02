import { type JSX } from 'react';

import { isFragment } from 'react-is';

import { classNames, type ComponentProps } from '~/components/types';

export interface MenuFooterProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
}

export const MenuFooter = ({ children, ...props }: MenuFooterProps): JSX.Element | null =>
  children && !isFragment(children) ? (
    <div {...props} className={classNames('menu__footer', props.className)}>
      {children}
    </div>
  ) : null;
