"use client";
import { type BrandSkill } from "~/prisma/model";

import { BadgeCollection } from "~/components/badges/BadgeCollection";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { type ComponentProps } from "~/components/types";

import { SkillBadge } from "./SkillBadge";

export interface SkillsProps extends ComponentProps {
  readonly skills: BrandSkill[];
}

export const Skills = ({ skills, ...props }: SkillsProps): JSX.Element => {
  const { open, ids } = useDrawers();
  if (skills.length === 0) {
    return <></>;
  }
  return (
    <BadgeCollection {...props}>
      {skills.map(skill => (
        <SkillBadge
          key={skill.id}
          skill={skill}
          onClick={() => open(ids.VIEW_SKILL, { skillId: skill.id })}
        />
      ))}
    </BadgeCollection>
  );
};
