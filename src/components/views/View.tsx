import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface ViewProps extends ComponentProps {
  readonly children?: React.ReactNode;
  readonly screen?: boolean;
  readonly overlay?: boolean;
}

export const View = ({ children, screen = false, overlay = false, ...props }: ViewProps) => (
  <div
    {...props}
    className={clsx(
      "loading",
      { "view--overlay": overlay, "view--screen": screen },
      props.className,
    )}
  >
    {children}
  </div>
);
