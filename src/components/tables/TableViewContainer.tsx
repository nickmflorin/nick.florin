import React, { type ReactNode } from "react";

import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface TableViewContainerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
}

export const TableViewContainer = ({
  children,
  ...props
}: TableViewContainerProps): JSX.Element => (
  <div {...props} className={classNames("table-view", props.className)}>
    {children}
  </div>
);
