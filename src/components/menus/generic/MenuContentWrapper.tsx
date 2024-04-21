import { memo } from "react";

import clsx from "clsx";

import type { ComponentProps } from "~/components/types";

export interface MenuContentWrapperProps extends ComponentProps {
  readonly children: JSX.Element;
}

export const MenuContentWrapper = memo(
  ({ children, ...props }: MenuContentWrapperProps): JSX.Element => (
    <div {...props} className={clsx("menu__content-wrapper", props.className)}>
      {children}
    </div>
  ),
);

export default MenuContentWrapper;
