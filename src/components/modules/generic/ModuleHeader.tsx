import clsx from "clsx";

import { type Action } from "~/components/structural";
import { Actions } from "~/components/structural/Actions";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ModuleHeaderProps extends ComponentProps {
  readonly actions?: Action[];
  readonly innerActions?: Action[];
  readonly children: string;
}

export const ModuleHeader = ({ actions, children, innerActions, ...props }: ModuleHeaderProps) => (
  <div
    {...props}
    className={clsx("flex flex-row items-center h-[32px] justify-between", props.className)}
  >
    <div className="flex flex-row items-center gap-[12px]">
      <Title order={3} className="leading-[32px]">
        {children}
      </Title>
      <Actions actions={innerActions ?? null} />
    </div>
    <Actions actions={actions ?? null} />
  </div>
);
