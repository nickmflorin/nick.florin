import { forwardRef, type ForwardedRef, type ReactNode } from "react";

import { classNames, type ComponentProps } from "~/components/types";

import { MenuContent } from "./MenuContent";
import { MenuFooter } from "./MenuFooter";
import { MenuHeader } from "./MenuHeader";
import { MenuItem } from "./MenuItem";
import { MenuItemGroup } from "./MenuItemGroup";

export interface MenuProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalMenu = forwardRef(
  ({ children, ...props }: MenuProps, ref: ForwardedRef<HTMLDivElement>): JSX.Element => (
    <div {...props} className={classNames("menu", props.className)} ref={ref}>
      {children}
    </div>
  ),
);

export const Menu = Object.assign(LocalMenu, {
  Content: MenuContent,
  Footer: MenuFooter,
  Item: MenuItem,
  ItemGroup: MenuItemGroup,
  Header: MenuHeader,
});

export default Menu;
