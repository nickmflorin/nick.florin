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
  <div
    {...props}
    className={clsx("flex flex-row items-center h-[32px] justify-between", props.className)}
  >
    <Title order={3} className="leading-[32px]">
      {children}
    </Title>
    <Actions actions={actions} />
  </div>
);
