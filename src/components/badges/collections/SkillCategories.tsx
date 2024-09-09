import { type SkillCategory } from "~/prisma/model";

import { type ComponentProps } from "~/components/types";

import { SkillCategoryBadge } from "../SkillCategoryBadge";

import { BadgeCollection } from "./BadgeCollection";

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
