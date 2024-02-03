import clsx from "clsx";

import { type Skill } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface SkillBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<Skill, "label"> | string;
}

export const SkillBadge = ({ skill, ...props }: SkillBadgeProps): JSX.Element => (
  <Badge size="xs" {...props} className={clsx("bg-blue-100 text-blue-500", props.className)}>
    {typeof skill === "string" ? skill : skill.label}
  </Badge>
);
