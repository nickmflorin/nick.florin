import { forwardRef, type ForwardedRef } from "react";

import type * as types from "../types";

import MenuContentWrapper from "~/components/menus/generic/MenuContentWrapper";

import { AbstractMenuContent } from "./AbstractMenuContent";
import { MenuContainer } from "./MenuContainer";
import { MenuFooter } from "./MenuFooter";
import { MenuHeader } from "./MenuHeader";

export const AbstractMenu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      className,
      style,
      header,
      footer,
      data,
      value,
      children,
      onItemClick,
      ...props
    }: types.AbstractMenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <MenuContainer style={style} className={className} ref={ref}>
      <MenuHeader>{header}</MenuHeader>
      <MenuContentWrapper>
        <AbstractMenuContent {...props} data={data} value={value} onItemClick={onItemClick}>
          {children}
        </AbstractMenuContent>
      </MenuContentWrapper>
      <MenuFooter>{footer}</MenuFooter>
    </MenuContainer>
  ),
) as types.AbstractMenuComponent;

export default AbstractMenu;
