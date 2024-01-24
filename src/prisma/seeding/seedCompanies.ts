import omit from "lodash.omit";

import { prisma } from "../client";
import { json } from "../fixtures";
import { type Experience, type Company } from "../model";

import { type SeedContext } from "./types";
import { findCorresponding } from "./util";

type JsonCompany = (typeof json.companies)[number];
type JsonExperience = (typeof json.companies)[number]["experiences"][number];

type Update<M extends { id: string }, J> = {
  id: M["id"];
  model: M;
  json: J;
};

type CompanyUpdateOrCreates = {
  readonly create: JsonCompany[];
  readonly update: Update<Company, Omit<JsonCompany, "experiences">>[];
  readonly updateExperiences: Update<Experience, JsonExperience>[];
  readonly createExperiences: {
    readonly experience: JsonExperience;
    readonly company: Company;
  }[];
};

export async function seedCompanies(ctx: SeedContext) {
  const companies = await prisma.company.findMany({ include: { experiences: true } });

  let companyChanges: CompanyUpdateOrCreates = {
    create: [],
    update: [],
    updateExperiences: [],
    createExperiences: [],
  };
  const experiences = await prisma.experience.findMany({
    where: { companyId: { in: companies.map(s => s.id) } },
  });
  for (const jsonCompany of json.companies) {
    const company = findCorresponding(companies, jsonCompany, {
      field: "name",
      reference: "company",
    });
    if (company) {
      const companyExperiences = experiences.filter(e => e.companyId === company.id);
      for (const jsonExp of jsonCompany.experiences) {
        /* Make sure that we are only looking at the experiences for the given company, because the
           title between two experiences may be the same if the company they are associated with
           is different. */
        const correspondingExp = findCorresponding(companyExperiences, jsonExp, {
          field: "title",
          reference: "experience",
        });
        if (correspondingExp) {
          companyChanges = {
            ...companyChanges,
            updateExperiences: [
              ...companyChanges.updateExperiences,
              { id: correspondingExp.id, model: correspondingExp, json: jsonExp },
            ],
          };
        } else {
          companyChanges = {
            ...companyChanges,
            createExperiences: [
              ...companyChanges.createExperiences,
              { experience: jsonExp, company },
            ],
          };
        }
      }
      companyChanges = {
        ...companyChanges,
        update: [
          ...companyChanges.update,
          { id: company.id, model: company, json: omit(jsonCompany, ["experiences"]) },
        ],
      };
    } else {
      companyChanges = {
        ...companyChanges,
        create: [...companyChanges.create, jsonCompany],
      };
    }
  }

  await Promise.all(
    companyChanges.create.map(({ experiences: jsonExperiences, ...company }) =>
      prisma.company.create({
        data: {
          ...company,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          experiences: {
            create: jsonExperiences.map(jsonExperience => ({
              ...jsonExperience,
              startDate: new Date(jsonExperience.startDate),
              endDate: jsonExperience.endDate ? new Date(jsonExperience.endDate) : undefined,
              createdBy: { connect: { id: ctx.user.id } },
              updatedBy: { connect: { id: ctx.user.id } },
            })),
          },
        },
      }),
    ),
  );

  await Promise.all(
    companyChanges.createExperiences.map(({ experience: jsonExperience, company }) =>
      prisma.experience.create({
        data: {
          ...jsonExperience,
          startDate: new Date(jsonExperience.startDate),
          endDate: jsonExperience.endDate ? new Date(jsonExperience.endDate) : undefined,
          createdBy: { connect: { id: ctx.user.id } },
          updatedBy: { connect: { id: ctx.user.id } },
          company: { connect: { id: company.id } },
        },
      }),
    ),
  );

  await Promise.all(
    companyChanges.update.map(({ id, json }) =>
      prisma.company.update({
        where: { id },
        data: {
          ...json,
          updatedById: ctx.user.id,
        },
      }),
    ),
  );

  await Promise.all(
    companyChanges.updateExperiences.map(({ id, json }) =>
      prisma.experience.update({
        where: { id },
        data: {
          startDate: new Date(json.startDate),
          endDate: json.endDate ? new Date(json.endDate) : undefined,
          updatedById: ctx.user.id,
        },
      }),
    ),
  );
}
