import { forwardRef, type ForwardedRef } from "react";

import clsx from "clsx";

import type * as types from "../types";

export const MenuContainer = forwardRef(
  (
    { children, ...props }: types.MenuContainerProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): JSX.Element => (
    <div {...props} className={clsx("menu", props.className)} ref={ref}>
      {children}
    </div>
  ),
);

export default MenuContainer;
