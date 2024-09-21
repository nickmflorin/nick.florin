import type { ReactNode } from "react";

import type { IconName, IconProp, IconSize } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography";

import { ResumeSimpleTileScaffold } from "./ResumeSimpleTileScaffold";

export interface ResumeSimpleTileProps extends ComponentProps {
  readonly icon: IconName | IconProp;
  readonly iconSize?: IconSize;
  readonly iconClassName?: ComponentProps["className"];
  readonly description: string | null;
  readonly children: ReactNode;
}

export const ResumeSimpleTile = ({
  icon,
  iconClassName,
  description,
  iconSize,
  children,
  ...props
}: ResumeSimpleTileProps) => (
  <ResumeSimpleTileScaffold
    {...props}
    icon={
      <Icon
        size={iconSize ?? 22}
        className={classNames("text-gray-700", iconClassName)}
        icon={icon}
      />
    }
    description={
      description !== null && description.trim().length !== 0 ? (
        <Description lineClamp={3} includeShowMoreLink>
          {description}
        </Description>
      ) : null
    }
  >
    {children}
  </ResumeSimpleTileScaffold>
);
