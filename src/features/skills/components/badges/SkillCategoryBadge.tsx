import { type SkillCategory, getSkillCategory } from "~/prisma/model";

import { Badge, type BadgeProps } from "~/components/badges/Badge";
import { classNames } from "~/components/types";

export interface SkillCategoryBadgeProps extends Omit<BadgeProps, "children"> {
  readonly category: SkillCategory;
}

export const SkillCategoryBadge = ({
  category,
  ...props
}: SkillCategoryBadgeProps): JSX.Element => (
  <Badge {...props} className={classNames("bg-orange-100 text-orange-800", props.className)}>
    {getSkillCategory(category).label}
  </Badge>
);
