import { type prisma } from "../client";

import { type Project } from "./core";

export type ProjectIncludes = {
  readonly skills?: boolean;
};

type ProjectSkills = Awaited<ReturnType<typeof prisma.skill.findMany>>;

export type ProjectSkill = ProjectSkills[number];

export type ApiProject<I extends ProjectIncludes | undefined = undefined> = I extends {
  skills: true;
}
  ? Project & {
      readonly skills: ProjectSkill[];
    }
  : Project;
