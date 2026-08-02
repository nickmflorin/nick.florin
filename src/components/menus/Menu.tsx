import { type JSX, type ReactNode, type Ref } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

import { MenuContent } from './MenuContent';
import { MenuFooter } from './MenuFooter';
import { MenuHeader } from './MenuHeader';
import { MenuItem } from './MenuItem';
import { MenuItemGroup } from './MenuItemGroup';

export interface MenuProps extends ComponentProps {
  readonly children: ReactNode;
  readonly ref?: Ref<HTMLDivElement>;
}

const LocalMenu = ({ children, ref, ...props }: MenuProps): JSX.Element => (
  <div {...props} className={classNames('menu', props.className)} ref={ref}>
    {children}
  </div>
);

export const Menu = Object.assign(LocalMenu, {
  Content: MenuContent,
  Footer: MenuFooter,
  Header: MenuHeader,
  Item: MenuItem,
  ItemGroup: MenuItemGroup,
});
