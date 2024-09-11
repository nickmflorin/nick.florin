import { type Skill } from "~/prisma/model";

import { classNames } from "~/components/types";

import { Badge, type BadgeProps } from "./Badge";

export interface SkillBadgeProps extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<Skill, "label" | "id">;
}

export const SkillBadge = ({ skill, ...props }: SkillBadgeProps): JSX.Element => (
  <Badge
    {...props}
    className={classNames(
      "bg-blue-100 text-blue-900",
      props.fontSize === undefined && classNames("text-sm", props.className),
      props.fontSize === undefined && classNames("max-md:text-xs", props.className),
      { "hover:bg-blue-200": props.onClick !== undefined },
      props.className,
    )}
  >
    {skill.label}
  </Badge>
);
