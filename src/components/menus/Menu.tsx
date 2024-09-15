import { forwardRef, type ForwardedRef } from "react";

import type * as types from "./types";

import { MenuContainer } from "./MenuContainer";
import { MenuContent } from "./MenuContent";
import { MenuContentWrapper } from "./MenuContentWrapper";
import { MenuFooter } from "./MenuFooter";
import { MenuHeader } from "./MenuHeader";

export const Menu = forwardRef(
  <M extends types.MenuModel, O extends types.MenuOptions<M>>(
    {
      className,
      style,
      header,
      footer,
      search,
      contentIsLoading,
      onSearch,
      ...props
    }: types.MenuProps<M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <MenuContainer style={style} className={className} ref={ref}>
      <MenuHeader search={search} onSearch={onSearch}>
        {header}
      </MenuHeader>
      <MenuContentWrapper contentIsLoading={contentIsLoading}>
        <MenuContent {...props} />
      </MenuContentWrapper>
      <MenuFooter>{footer}</MenuFooter>
    </MenuContainer>
  ),
) as types.MenuComponent;

export default Menu;
