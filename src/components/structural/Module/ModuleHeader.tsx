import { type Action } from "~/components/structural/Actions";
import { Actions } from "~/components/structural/Actions";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography";

export interface ModuleHeaderProps extends ComponentProps {
  readonly actions?: Action[];
  readonly children: string;
}

export const ModuleHeader = ({ actions, children, ...props }: ModuleHeaderProps) => (
  <div {...props} className={classNames("module__header", props.className)}>
    <Title component="h3">{children}</Title>
    <Actions actions={actions ?? []} />
  </div>
);
