import { type z } from "zod";

import * as schemas from "../schemas";

import companies from "./companies.json";
import profile from "./profile.json";
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
  profile,
};
