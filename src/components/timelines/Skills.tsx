import clsx from "clsx";

import { SkillBadge } from "~/components/badges/SkillBadge";
import { type ComponentProps } from "~/components/types";
import { type Skill } from "~/prisma/model";

export interface SkillsProps extends ComponentProps {
  readonly skills: Skill[];
}

export const Skills = ({ skills, ...props }: SkillsProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-wrap gap-y-[4px] gap-x-[4px]", props.className)}>
    {skills
      .filter(sk => sk.visible !== false)
      .map(skill => (
        <SkillBadge key={skill.id} skill={skill} className="bg-blue-100 text-blue-500" />
      ))}
  </div>
);
