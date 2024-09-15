import { type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface MultiValueRendererContainerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly dynamicHeight?: boolean;
}

/* If the 'dynamicHeight' prop is set to false, it means that the Select input should only show
   one "row" of badges, or text, and badges that cause the inner content to exceed the width of
   the Select should not cause the Select to expand in height, but rather, the badges to truncate
   with ellipsis overflow.  This means that the 'flex-wrap' should only be set if the
   'dynamicHeight' prop is true. */
export const MultiValueRendererContainer = ({
  dynamicHeight = true,
  children,
  ...props
}: MultiValueRendererContainerProps) => (
  <div
    {...props}
    className={classNames(
      "flex gap-x-[4px] overflow-hidden",
      {
        "flex-wrap gap-y-[4px]": dynamicHeight,
        "flex-row": !dynamicHeight,
      },
      props.className,
    )}
  >
    {children}
  </div>
);
