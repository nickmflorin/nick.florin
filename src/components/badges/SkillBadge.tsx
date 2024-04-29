import clsx from "clsx";

import { type Skill } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface SkillBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<Skill, "label" | "id">;
}

export const SkillBadge = ({ skill, ...props }: SkillBadgeProps): JSX.Element => (
  <Badge
    {...props}
    className={clsx(
      "bg-blue-100 text-blue-500 hover:bg-blue-200 text-sm max-md:text-xs",
      props.className,
    )}
  >
    {skill.label}
  </Badge>
);
