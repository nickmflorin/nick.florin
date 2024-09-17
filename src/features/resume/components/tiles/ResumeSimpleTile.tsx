import type { ReactNode } from "react";

import type { IconName, IconProp, IconSize } from "~/components/icons";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography";

const TileInner = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-row items-center justify-between h-[24px]">{children}</div>
);

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
  <div
    {...props}
    className={classNames(
      "flex flex-row gap-[12px] max-w-full w-full overflow-hidden",
      { "items-center": description === null || description.trim().length === 0 },
      props.className,
    )}
  >
    <Icon
      size={iconSize ?? 22}
      className={classNames("text-gray-700", iconClassName)}
      icon={icon}
    />
    {description === null || description.trim().length === 0 ? (
      <TileInner>{children}</TileInner>
    ) : (
      <div className={classNames("flex flex-col gap-[2px] overflow-hidden")}>
        <TileInner>{children}</TileInner>
        <Description lineClamp={3} includeShowMoreLink>
          {description}
        </Description>
      </div>
    )}
  </div>
);
