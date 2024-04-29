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
    <div className="flex flex-row items-center gap-[12px]">
      <Title className="leading-[32px] text-title_md max-md:text-title_sm max-md:leading-[26px]">
        {children}
      </Title>
    </div>
    <Actions actions={actions ?? null} />
  </div>
);
