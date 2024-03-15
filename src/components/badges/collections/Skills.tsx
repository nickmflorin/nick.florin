"use client";
import { type Skill } from "~/prisma/model";
import { type ComponentProps } from "~/components/types";
import { useMutableParams } from "~/hooks";

import { SkillBadge } from "../SkillBadge";

import { BadgeCollection } from "./BadgeCollection";

export interface SkillsProps extends ComponentProps {
  readonly skills: Skill[];
}

export const Skills = ({ skills, ...props }: SkillsProps): JSX.Element => {
  const { set } = useMutableParams();

  return (
    <BadgeCollection {...props}>
      {skills
        .filter(sk => sk.visible !== false)
        .map(skill => (
          <SkillBadge
            key={skill.id}
            skill={skill}
            className="bg-blue-100 text-blue-500"
            onClick={() => set("skillId", skill.id)}
          />
        ))}
    </BadgeCollection>
  );
};
