import omit from "lodash.omit";

import { prisma } from "../client";
import { json } from "../fixtures";
import { safeEnumValue, Degree, type Education, type School } from "../model";

import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

type JsonSchool = (typeof json.schools)[number];
type JsonEducation = (typeof json.schools)[number]["educations"][number];

type Update<M extends { id: string }, J> = {
  id: M["id"];
  model: M;
  json: J;
};

type SchoolUpdateOrCreates = {
  readonly create: JsonSchool[];
  readonly update: Update<School, Omit<JsonSchool, "educations">>[];
  readonly updateEducations: Update<Education, JsonEducation>[];
  readonly createEducations: {
    readonly education: JsonEducation;
    readonly school: School;
  }[];
};

export async function seedSchools(ctx: SeedContext) {
  const schools = await prisma.school.findMany({ include: { educations: true } });

  let schoolChanges: SchoolUpdateOrCreates = {
    create: [],
    update: [],
    updateEducations: [],
    createEducations: [],
  };
  const educations = await prisma.education.findMany({
    where: { schoolId: { in: schools.map(s => s.id) } },
  });
  for (const jsonSchool of json.schools) {
    const school = findCorresponding(schools, jsonSchool, {
      field: "name",
      reference: "school",
    });
    if (school) {
      const schoolEducations = educations.filter(e => e.schoolId === school.id);
      for (const jsonEdu of jsonSchool.educations) {
        const correspondingEdu = findCorresponding(schoolEducations, jsonEdu, {
          field: "major",
          reference: "education",
        });
        if (correspondingEdu) {
          schoolChanges = {
            ...schoolChanges,
            updateEducations: [
              ...schoolChanges.updateEducations,
              { id: correspondingEdu.id, model: correspondingEdu, json: jsonEdu },
            ],
          };
        } else {
          schoolChanges = {
            ...schoolChanges,
            createEducations: [...schoolChanges.createEducations, { education: jsonEdu, school }],
          };
        }
      }
      schoolChanges = {
        ...schoolChanges,
        update: [
          ...schoolChanges.update,
          { id: school.id, model: school, json: omit(jsonSchool, ["educations"]) },
        ],
      };
    } else {
      schoolChanges = {
        ...schoolChanges,
        create: [...schoolChanges.create, jsonSchool],
      };
    }
  }

  const createdSchools = await Promise.all(
    schoolChanges.create.map(({ educations: jsonEducations, ...school }) =>
      prisma.school.create({
        data: {
          ...school,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          educations: {
            create: jsonEducations.map(jsonEducation => ({
              ...jsonEducation,
              degree: safeEnumValue(jsonEducation.degree, Degree),
              startDate: new Date(jsonEducation.startDate),
              endDate: jsonEducation.endDate ? new Date(jsonEducation.endDate) : undefined,
              createdBy: { connect: { id: ctx.user.id } },
              updatedBy: { connect: { id: ctx.user.id } },
            })),
          },
        },
      }),
    ),
  );
  if (createdSchools.length !== 0) {
    /* eslint-disable-next-line no-console */
    console.info(`Created ${createdSchools.length} New School(s)`);
  }

  const createdEducations = await Promise.all(
    schoolChanges.createEducations.map(({ education: jsonEducation, school }) =>
      prisma.education.create({
        data: {
          ...jsonEducation,
          degree: safeEnumValue(jsonEducation.degree, Degree),
          startDate: new Date(jsonEducation.startDate),
          endDate: jsonEducation.endDate ? new Date(jsonEducation.endDate) : undefined,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          school: { connect: { id: school.id } },
        },
      }),
    ),
  );
  if (createdEducations.length !== 0) {
    /* eslint-disable-next-line no-console */
    console.info(`Created ${createdEducations.length} New Education(s)`);
  }

  const updatedSchools = await Promise.all(
    schoolChanges.update.map(({ id, json }) =>
      prisma.school.update({
        where: { id },
        data: {
          ...json,
          updatedById: ctx.user.id,
        },
      }),
    ),
  );
  if (updatedSchools.length !== 0) {
    /* eslint-disable-next-line no-console */
    console.info(`Updated ${updatedSchools.length} School(s)`);
  }

  const updatedEducations = await Promise.all(
    schoolChanges.updateEducations.map(({ id, json }) =>
      prisma.education.update({
        where: { id },
        data: {
          ...json,
          degree: safeEnumValue(json.degree, Degree),
          startDate: new Date(json.startDate),
          endDate: json.endDate ? new Date(json.endDate) : undefined,
          updatedById: ctx.user.id,
        },
      }),
    ),
  );
  if (updatedEducations.length !== 0) {
    /* eslint-disable-next-line no-console */
    console.info(`Updated ${updatedEducations.length} Education(s)`);
  }
}
