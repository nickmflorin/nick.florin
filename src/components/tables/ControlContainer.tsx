import { memo } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

interface ControlContainerProps extends ComponentProps {
  readonly children: JSX.Element | undefined;
}

export const ControlContainer = memo(({ children, ...props }: ControlContainerProps) =>
  children ? (
    <div
      className={classNames(
        "flex flex-row items-center relative [&>*]:h-fill [&>*]:max-h-fill",
        props.className,
      )}
    >
      {children}
    </div>
  ) : (
    <></>
  ),
);
