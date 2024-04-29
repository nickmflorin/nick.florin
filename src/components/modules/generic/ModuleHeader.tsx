import clsx from "clsx";

import { type Action } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ModuleHeaderProps extends ComponentProps {
  readonly actions?: Action[];
  readonly children: string;
}

export const ModuleHeader = ({ actions, children, ...props }: ModuleHeaderProps) => (
  <div {...props} className={clsx("module__header", props.className)}>
    <Title>{children}</Title>
    <Actions actions={actions ?? null} />
  </div>
);
