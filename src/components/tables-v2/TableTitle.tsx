import type { ReactNode } from "react";

import { Badge } from "~/components/badges/Badge";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Title } from "~/components/typography";

export interface TableTitleProps extends ComponentProps {
  readonly children: ReactNode;
  readonly count: ReactNode;
}

export const TableTitle = ({ children, count, ...props }: TableTitleProps): JSX.Element => (
  <div {...props} className={classNames("flex flex-row items-center gap-4", props.className)}>
    <Title component="h3">{children}</Title>
    <Badge>{count}</Badge>
  </div>
);
