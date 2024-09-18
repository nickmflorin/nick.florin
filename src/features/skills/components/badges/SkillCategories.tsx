import { type SkillCategory } from "~/database/model";

import { BadgeCollection } from "~/components/badges/BadgeCollection";
import { type ComponentProps } from "~/components/types";

import { SkillCategoryBadge } from "./SkillCategoryBadge";

export interface SkillCategoriesProps extends ComponentProps {
  readonly categories: SkillCategory[];
}

export const SkillCategories = ({ categories, ...props }: SkillCategoriesProps): JSX.Element => (
  <BadgeCollection {...props}>
    {categories.map(cat => (
      <SkillCategoryBadge key={cat.toLowerCase()} category={cat} />
    ))}
  </BadgeCollection>
);
