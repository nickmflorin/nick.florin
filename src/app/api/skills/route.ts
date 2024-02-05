import { type NextRequest } from "next/server";

import { DateTime } from "luxon";

import { ClientResponse } from "~/application/http";
import { minDate, strictArrayLookup } from "~/lib";
import { prisma } from "~/prisma/client";
import { type ApiSkill } from "~/prisma/model";

import { SkillQuerySchema } from "../types";

export async function GET(request: NextRequest) {
  const query = { showTopSkills: request.nextUrl.searchParams.get("showTopSkills") };
  const parsedQuery = SkillQuerySchema.safeParse(query);
  if (!parsedQuery.success) {
    return ClientResponse.BadRequest("Invalid query parameters!").toResponse();
  }
  const { showTopSkills } = parsedQuery.data;

  const skills = await prisma.skill.findMany({
    where: { includeInTopSkills: true },
  });

  const experiences = await prisma.experience.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) }, skill: { includeInTopSkills: true } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true },
  });

  const educations = await prisma.education.findMany({
    where: {
      skills: {
        some: { skillId: { in: skills.map(s => s.id) }, skill: { includeInTopSkills: true } },
      },
    },
    orderBy: { startDate: "asc" },
    include: { skills: true },
  });

  const data: ApiSkill[] = [];
  for (const skill of skills) {
    if (skill.experience !== null) {
      data.push(skill as ApiSkill);
    } else {
      /* Since the educations are already ordered by their start date, we can just take the first
         one from the filtered results. */
      const oldestEducation = strictArrayLookup(
        educations.filter(edu => edu.skills.some(s => s.skillId === skill.id)),
        0,
        {},
      );
      /* Since the experiences are already ordered by their start date, we can just take the first
         one from the filtered results. */
      const oldestExperience = strictArrayLookup(
        experiences.filter(exp => exp.skills.some(s => s.skillId === skill.id)),
        0,
        {},
      );
      const oldestDate = minDate(oldestEducation?.startDate, oldestExperience?.startDate);
      if (oldestDate) {
        data.push({
          ...skill,
          experience: Math.round(
            DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years,
          ),
        });
      }
    }
  }
  const sorted = data.sort((a, b) => b.experience - a.experience);
  return ClientResponse.OK(
    showTopSkills === "all" ? sorted : sorted.slice(0, showTopSkills),
  ).toResponse();
}
