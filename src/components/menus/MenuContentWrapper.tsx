import { memo } from "react";

import { Loading } from "~/components/feedback/Loading";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface MenuContentWrapperProps extends ComponentProps {
  readonly contentIsLoading?: boolean;
  readonly children: JSX.Element;
}

export const MenuContentWrapper = memo(
  ({ children, contentIsLoading, ...props }: MenuContentWrapperProps): JSX.Element => (
    <div {...props} className={classNames("menu__content-wrapper", props.className)}>
      <Loading isLoading={contentIsLoading} spinnerSize="16px" />
      {children}
    </div>
  ),
);

export default MenuContentWrapper;
