"use client";
import { type ApiSkill } from "~/database/model";

import { Badge, type BadgeProps } from "~/components/badges/Badge";

export interface SkillExperienceBadgeProps
  extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<ApiSkill, "calculatedExperience">;
}

export const SkillExperienceBadge = ({
  skill,
  ...props
}: SkillExperienceBadgeProps): JSX.Element => (
  <Badge {...props}>
    {`${skill.calculatedExperience} year${skill.calculatedExperience === 1 ? "" : "s"}`}
  </Badge>
);
