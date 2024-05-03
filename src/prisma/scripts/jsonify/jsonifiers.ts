import omit from "lodash.omit";
import { type z } from "zod";

import type * as types from "./types";

import type { Transaction } from "~/prisma/client";
import type {
  BrandSchool,
  BrandEducation,
  BrandSkill,
  BrandDetail,
  BrandNestedDetail,
  BrandProject,
  BrandCourse,
  BrandCompany,
  BrandExperience,
  BrandRepository,
  BrandProfile,
} from "~/prisma/model";
import { DetailEntityType } from "~/prisma/model";

import { type JsonSchemas } from "../fixtures";
import { stdout } from "../stdout";

import { cleanModel } from "./util";

type JsonifierInputModel<T extends types.JsonifiableModel> = {
  school: BrandSchool & {
    readonly educations: (Omit<BrandEducation, "school"> & {
      skills: BrandSkill[];
      details: (BrandDetail & {
        project: BrandProject | null;
        nestedDetails: (BrandNestedDetail & {
          readonly project: BrandProject | null;
          readonly skills: BrandSkill[];
        })[];
        skills: BrandSkill[];
      })[];
      courses: (BrandCourse & { skills: BrandSkill[] })[];
    })[];
  };
  company: BrandCompany & {
    readonly experiences: (Omit<BrandExperience, "company"> & {
      skills: BrandSkill[];
      details: (BrandDetail & {
        project: BrandProject | null;
        nestedDetails: (BrandNestedDetail & {
          readonly project: BrandProject | null;
          readonly skills: BrandSkill[];
        })[];
        skills: BrandSkill[];
      })[];
    })[];
  };
  skill: BrandSkill;
  project: BrandProject & {
    readonly skills: BrandSkill[];
    readonly repositories: BrandRepository[];
  };
  repository: BrandRepository & {
    readonly skills: BrandSkill[];
  };
  profile: BrandProfile;
}[T];

export type Jsonifier<T extends types.JsonifiableModel> = {
  readonly jsonify: (model: JsonifierInputModel<T>) => z.infer<(typeof JsonSchemas)[T]>;
  readonly data: (tx: Transaction) => Promise<JsonifierInputModel<T>[]>;
};

export const Jsonifiers: {
  [key in types.JsonifiableModel]: Jsonifier<key>;
} = {
  skill: {
    data: async tx => await tx.skill.findMany(),
    /* The calculated experience values should not be stored in JSON, because they will be
       recalculated during the seeding process. */
    jsonify: model => omit(cleanModel(model), "calculatedExperience"),
  },
  profile: {
    data: async tx => await tx.profile.findMany(),
    jsonify: model => cleanModel(model),
  },
  repository: {
    data: async tx => await tx.repository.findMany({ include: { skills: true } }),
    jsonify: model => ({
      ...cleanModel(model),
      skills: model.skills.map(s => s.slug),
    }),
  },
  project: {
    data: async tx => await tx.project.findMany({ include: { skills: true, repositories: true } }),
    jsonify: model => ({
      ...cleanModel(model),
      skills: model.skills.map(s => s.slug),
      repositories: model.repositories.map(s => s.slug),
    }),
  },
  company: {
    data: async tx => {
      const companies = await tx.company.findMany({
        include: {
          experiences: { include: { skills: true } },
        },
      });
      const exps = await tx.experience.findMany({
        include: {
          skills: true,
        },
      });
      const details = await tx.detail.findMany({
        include: {
          nestedDetails: { include: { project: true, skills: true } },
          project: true,
          skills: true,
        },
        where: { entityType: DetailEntityType.EXPERIENCE },
      });
      /* Note: This check is important to perform because there are no foreign key constraints on
         the relationship between details and their counterparts due to the generic nature of the
         model associated with a detail. */
      const leftoverDetails = details.filter(det => !exps.map(e => e.id).includes(det.entityId));
      if (leftoverDetails.length !== 0) {
        stdout.warn(
          "Encountered details that belong to experiences that no longer exist...",
          leftoverDetails.map(d => ({
            label: "Detail",
            items: [
              { label: "id", value: d.id },
              { label: "description", value: d.description ?? "" },
            ],
          })),
        );
      }
      return companies.map(company => ({
        ...company,
        experiences: exps
          .filter(e => e.companyId === company.id)
          .map(exp => ({
            ...exp,
            details: details.filter(d => d.entityId === exp.id),
          })),
      }));
    },
    jsonify: ({ experiences, ...model }) => ({
      ...cleanModel(model),
      experiences: experiences.map(exp => ({
        ...cleanModel(exp),
        skills: exp.skills.map(s => s.slug),
        details: exp.details
          .map(({ skills, nestedDetails, ...detail }) => ({
            ...cleanModel(detail),
            project: detail.project?.slug,
            skills: skills.map(s => s.slug),
            nestedDetails: nestedDetails?.map(nestedDetail => ({
              ...cleanModel(nestedDetail),
              project: detail.project?.slug,
              skills: nestedDetail.skills.map(s => s.slug),
            })),
          }))
          .map(cleanModel),
      })),
    }),
  },
  school: {
    data: async tx => {
      const schools = await tx.school.findMany({
        include: {
          educations: { include: { skills: true, courses: { include: { skills: true } } } },
        },
      });
      const edus = await tx.education.findMany({
        include: {
          skills: true,
          courses: { include: { skills: true } },
        },
      });
      const details = await tx.detail.findMany({
        include: {
          nestedDetails: { include: { project: true, skills: true } },
          project: true,
          skills: true,
        },
        where: { entityType: DetailEntityType.EDUCATION },
      });
      /* Note: This check is important to perform because there are no foreign key constraints on
         the relationship between details and their counterparts due to the generic nature of the
         model associated with a detail. */
      const leftoverDetails = details.filter(det => !edus.map(e => e.id).includes(det.entityId));
      if (leftoverDetails.length !== 0) {
        stdout.warn(
          "Encountered details that belong to educations that no longer exist...",
          leftoverDetails.map(d => ({
            label: "Detail",
            items: [
              { label: "id", value: d.id },
              { label: "description", value: d.description ?? "" },
            ],
          })),
        );
      }
      return schools.map(school => ({
        ...school,
        educations: edus
          .filter(e => e.schoolId === school.id)
          .map(edu => ({
            ...edu,
            details: details.filter(d => d.entityId === edu.id),
          })),
      }));
    },
    jsonify: ({ educations, ...model }) => ({
      ...cleanModel(model),
      educations: educations.map(edu => ({
        ...cleanModel(edu),
        skills: edu.skills.map(s => s.slug),
        courses: edu.courses
          .map(({ skills, ...course }) => ({
            ...omit(course, ["id"]),
            skills: skills.map(s => s.slug),
          }))
          .map(cleanModel),
        details: edu.details
          .map(({ skills, nestedDetails, ...detail }) => ({
            ...cleanModel(detail),
            project: detail.project?.slug,
            skills: skills.map(s => s.slug),
            nestedDetails: nestedDetails?.map(nestedDetail => ({
              ...cleanModel(nestedDetail),
              project: detail.project?.slug,
              skills: nestedDetail.skills.map(s => s.slug),
            })),
          }))
          .map(cleanModel),
      })),
    }),
  },
};
