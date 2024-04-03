"use client";
import { type Skill } from "~/prisma/model";
import { useDrawers } from "~/components/drawers/hooks";
import { type ComponentProps } from "~/components/types";

import { SkillBadge } from "../SkillBadge";

import { BadgeCollection } from "./BadgeCollection";

export interface SkillsProps extends ComponentProps {
  readonly skills: Skill[];
}

export const Skills = ({ skills, ...props }: SkillsProps): JSX.Element => {
  const { open, ids } = useDrawers();
  if (skills.length === 0) {
    return <></>;
  }
  return (
    <BadgeCollection {...props}>
      {skills
        .filter(sk => sk.visible !== false)
        .map(skill => (
          <SkillBadge
            key={skill.id}
            skill={skill}
            className="bg-blue-100 text-blue-500"
            onClick={() => open(ids.VIEW_SKILL, { skillId: skill.id })}
          />
        ))}
    </BadgeCollection>
  );
};
