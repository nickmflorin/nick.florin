import { type z } from "zod";

import * as schemas from "../schemas";

import companies from "./companies.json";
import profiles from "./profiles.json";
import projects from "./projects.json";
import repositories from "./repositories.json";
import schools from "./schools.json";
import skills from "./skills.json";

export const json = {
  schools: schools.schools.map(
    (c): z.infer<typeof schemas.SchoolJsonSchema> => schemas.SchoolJsonSchema.parse(c),
  ),
  skills: skills.skills.map(
    (sk): z.infer<typeof schemas.SkillJsonSchema> => schemas.SkillJsonSchema.parse(sk),
  ),
  companies: companies.companies.map(
    (c): z.infer<typeof schemas.CompanyJsonSchema> => schemas.CompanyJsonSchema.parse(c),
  ),
  profiles: profiles.profiles.map(
    (p): z.infer<typeof schemas.ProfileJsonSchema> => schemas.ProfileJsonSchema.parse(p),
  ),
  projects: projects.projects.map(
    (p): z.infer<typeof schemas.ProjectJsonSchema> => schemas.ProjectJsonSchema.parse(p),
  ),
  repositories: repositories.repositories.map(
    (p): z.infer<typeof schemas.RepositoryJsonSchema> => schemas.RepositoryJsonSchema.parse(p),
  ),
};
