import { type NextRequest } from "next/server";

import difference from "lodash.difference";
import uniq from "lodash.uniq";

import { ClientResponse } from "~/application/http";
import { transformQueryParams, decodeQueryParams } from "~/lib/urls";
import { prisma } from "~/prisma/client";
import { type ApiSkill } from "~/prisma/model";
import { includeSkillMetadata } from "~/prisma/model";

import { SkillQuerySchema } from "../types";

const skillExperience = (skill: ApiSkill): number =>
  skill.experience === null ? skill.autoExperience : skill.experience;

export async function GET(request: NextRequest) {
  const parsedQuery = SkillQuerySchema.safeParse(decodeQueryParams(request.nextUrl.searchParams));
  if (!parsedQuery.success) {
    return ClientResponse.ValidationError(parsedQuery.error, SkillQuerySchema).toResponse();
  }
  const {
    showTopSkills,
    educations: _queryEducations = [],
    experiences: _queryExperiences = [],
    programmingDomains,
    programmingLanguages,
    categories,
  } = parsedQuery.data;

  const queryEducations = uniq(_queryEducations);
  const queryExperiences = uniq(_queryExperiences);

  let invalidEducationsIds: string[] = [];
  let invalidExperienceIds: string[] = [];

  const educations =
    queryEducations.length !== 0
      ? await prisma.education.findMany({ where: { id: { in: queryEducations } } })
      : [];
  const educationIds = educations.map(e => e.id);
  if (educationIds.length !== queryEducations.length) {
    invalidEducationsIds = difference(queryEducations, educationIds);
    if (invalidEducationsIds.length === 0) {
      throw new TypeError(
        "Unexpected Condition: There should be at least one invalid ID if the number of valid " +
          "education IDs in the set is not equal to the length of the set.",
      );
    }
  }

  const experiences =
    queryExperiences.length !== 0
      ? await prisma.experience.findMany({ where: { id: { in: queryExperiences } } })
      : [];
  const experienceIds = experiences.map(e => e.id);
  if (experienceIds.length !== queryExperiences.length) {
    invalidExperienceIds = difference(queryExperiences, experienceIds);
    if (invalidExperienceIds.length === 0) {
      throw new TypeError(
        "Unexpected Condition: There should be at least one invalid ID if the number of valid " +
          "education IDs in the set is not equal to the length of the set.",
      );
    }
  }

  const resp = ClientResponse.BadRequest({
    educations: {
      code: "invalid",
      internalMessage: "Encountered education IDs that do not exist in the database.",
      conditional: invalidEducationsIds.length !== 0,
    },
    experiences: {
      code: "invalid",
      internalMessage: "Encountered experience IDs that do not exist in the database.",
      conditional: invalidExperienceIds.length !== 0,
    },
  });
  if (resp) {
    return resp.toResponse();
  }

  console.log({ programmingDomains, programmingLanguages, categories });
  const skills = await prisma.skill.findMany({
    where: {
      includeInTopSkills: true,
      visible: true,
      programmingDomains:
        programmingDomains && programmingDomains.length !== 0
          ? { hasSome: programmingDomains }
          : undefined,
      programmingLanguages:
        programmingLanguages && programmingLanguages.length !== 0
          ? { hasSome: programmingLanguages }
          : undefined,
      categories: categories && categories.length !== 0 ? { hasSome: categories } : undefined,
      educations:
        educationIds.length !== 0 ? { some: { educationId: { in: educationIds } } } : undefined,
      experiences:
        experienceIds.length !== 0 ? { some: { experienceId: { in: experienceIds } } } : undefined,
    },
  });

  const data = (await includeSkillMetadata(skills)).sort(
    (a, b) => skillExperience(b) - skillExperience(a),
  );
  return ClientResponse.OK(
    showTopSkills === "all" ? data : data.slice(0, showTopSkills),
  ).toResponse();
}
