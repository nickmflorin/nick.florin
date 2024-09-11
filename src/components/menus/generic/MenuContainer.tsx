import { forwardRef, type ForwardedRef } from "react";

import type * as types from "../types";

import { classNames } from "~/components/types";

export const MenuContainer = forwardRef(
  (
    { children, ...props }: types.MenuContainerProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <div {...props} className={classNames("menu", props.className)} ref={ref}>
      {children}
    </div>
  ),
);

export default MenuContainer;
