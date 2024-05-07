import { forwardRef, type ForwardedRef } from "react";

import type * as types from "../types";

import MenuContentWrapper from "~/components/menus/generic/MenuContentWrapper";

import { MenuContainer } from "./MenuContainer";
import { MenuContent } from "./MenuContent";
import { MenuFooter } from "./MenuFooter";
import { MenuHeader } from "./MenuHeader";

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    { className, style, header, footer, children, ...props }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <MenuContainer style={style} className={className} ref={ref}>
      <MenuHeader>{header}</MenuHeader>
      <MenuContentWrapper>
        <MenuContent {...props}>{children}</MenuContent>
      </MenuContentWrapper>
      <MenuFooter>{footer}</MenuFooter>
    </MenuContainer>
  ),
) as types.MenuComponent;

export default Menu;
