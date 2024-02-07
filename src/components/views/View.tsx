import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface ViewProps extends ComponentProps {
  readonly children?: React.ReactNode;
  readonly screen?: boolean;
  readonly overlay?: boolean;
  readonly dimmed?: boolean;
  readonly blurred?: boolean;
}

export const View = ({
  children,
  screen = false,
  dimmed = false,
  blurred = false,
  overlay = false,
  ...props
}: ViewProps) => (
  <div
    {...props}
    className={clsx(
      "view",
      {
        "view--overlay": overlay,
        "view--screen": screen,
        "view--blurred": blurred,
        "view--dimmed": dimmed,
      },
      props.className,
    )}
  >
    {children}
  </div>
);
