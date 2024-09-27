import React, { type ReactNode } from "react";

import { Loading } from "~/components/loading/Loading";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface TableViewContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
}

export const TableViewContent = ({
  children,
  isLoading = false,
  ...props
}: TableViewContentProps): JSX.Element => (
  <div {...props} className={classNames("table-view__content", props.className)}>
    <Loading isLoading={isLoading}>
      <div className="max-h-full h-full overflow-x-auto">{children}</div>
    </Loading>
  </div>
);
