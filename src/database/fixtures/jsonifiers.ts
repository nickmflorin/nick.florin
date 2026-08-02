import { omit } from 'lodash-es';
import { type z } from 'zod';

import type * as types from './types';

import {
  type BrandCompany,
  type BrandCourse,
  type BrandDetail,
  type BrandEducation,
  type BrandExperience,
  type BrandNestedDetail,
  type BrandProfile,
  type BrandProject,
  type BrandRepository,
  type BrandSchool,
  type BrandSkill,
  DetailEntityType,
} from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { stdout } from '~/support';

import { cleanModel } from './util';

import { type JsonSchemas } from '.';

type JsonifierInputModel<T extends types.JsonifiableModel> = {
  company: {
    readonly experiences: ({
      details: ({
        nestedDetails: ({
          readonly project: BrandProject | null;
          readonly skills: BrandSkill[];
        } & BrandNestedDetail)[];
        project: BrandProject | null;
        skills: BrandSkill[];
      } & BrandDetail)[];
      skills: BrandSkill[];
    } & Omit<BrandExperience, 'company'>)[];
  } & BrandCompany;
  profile: BrandProfile;
  project: {
    readonly repositories: BrandRepository[];
    readonly skills: BrandSkill[];
  } & BrandProject;
  repository: {
    readonly skills: BrandSkill[];
  } & BrandRepository;
  school: {
    readonly educations: ({
      courses: ({ skills: BrandSkill[] } & BrandCourse)[];
      details: ({
        nestedDetails: ({
          readonly project: BrandProject | null;
          readonly skills: BrandSkill[];
        } & BrandNestedDetail)[];
        project: BrandProject | null;
        skills: BrandSkill[];
      } & BrandDetail)[];
      skills: BrandSkill[];
    } & Omit<BrandEducation, 'school'>)[];
  } & BrandSchool;
  skill: BrandSkill;
}[T];

export type Jsonifier<T extends types.JsonifiableModel> = {
  readonly data: (tx: Transaction) => Promise<JsonifierInputModel<T>[]>;
  readonly jsonify: (model: JsonifierInputModel<T>) => z.infer<(typeof JsonSchemas)[T]>;
};

export const Jsonifiers: {
  [key in types.JsonifiableModel]: Jsonifier<key>;
} = {
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
      /* This check is important to perform because there are no foreign key constraints on the
         relationship between details and their counterparts due to the generic nature of the model
         associated with a detail. */
      const leftoverDetails = details.filter(det => !exps.map(e => e.id).includes(det.entityId));
      if (leftoverDetails.length !== 0) {
        stdout.warn(
          'Encountered details that belong to experiences that no longer exist...',
          leftoverDetails.map(d => ({
            items: [
              { label: 'id', value: d.id },
              { label: 'description', value: d.description ?? '' },
            ],
            label: 'Detail',
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
        details: exp.details
          .map(({ nestedDetails, skills, ...detail }) => ({
            ...cleanModel(detail),
            nestedDetails: nestedDetails.map(nestedDetail => ({
              ...cleanModel(nestedDetail),
              project: detail.project?.slug,
              skills: nestedDetail.skills.map(s => s.slug),
            })),
            project: detail.project?.slug,
            skills: skills.map(s => s.slug),
          }))
          .map(cleanModel),
        skills: exp.skills.map(s => s.slug),
      })),
    }),
  },
  profile: {
    data: async tx => await tx.profile.findMany(),
    jsonify: model => cleanModel(model),
  },
  project: {
    data: async tx => await tx.project.findMany({ include: { repositories: true, skills: true } }),
    jsonify: model => ({
      ...cleanModel(model),
      repositories: model.repositories.map(s => s.slug),
      skills: model.skills.map(s => s.slug),
    }),
  },
  repository: {
    data: async tx => await tx.repository.findMany({ include: { skills: true } }),
    jsonify: model => ({
      ...cleanModel(model),
      skills: model.skills.map(s => s.slug),
    }),
  },
  school: {
    data: async tx => {
      const schools = await tx.school.findMany({
        include: {
          educations: { include: { courses: { include: { skills: true } }, skills: true } },
        },
      });
      const edus = await tx.education.findMany({
        include: {
          courses: { include: { skills: true } },
          skills: true,
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
      /* This check is important to perform because there are no foreign key constraints on the
         relationship between details and their counterparts due to the generic nature of the model
         associated with a detail. */
      const leftoverDetails = details.filter(det => !edus.map(e => e.id).includes(det.entityId));
      if (leftoverDetails.length !== 0) {
        stdout.warn(
          'Encountered details that belong to educations that no longer exist...',
          leftoverDetails.map(d => ({
            items: [
              { label: 'id', value: d.id },
              { label: 'description', value: d.description ?? '' },
            ],
            label: 'Detail',
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
        courses: edu.courses
          .map(({ skills, ...course }) => ({
            ...omit(course, ['id']),
            skills: skills.map(s => s.slug),
          }))
          .map(cleanModel),
        details: edu.details
          .map(({ nestedDetails, skills, ...detail }) => ({
            ...cleanModel(detail),
            nestedDetails: nestedDetails.map(nestedDetail => ({
              ...cleanModel(nestedDetail),
              project: detail.project?.slug,
              skills: nestedDetail.skills.map(s => s.slug),
            })),
            project: detail.project?.slug,
            skills: skills.map(s => s.slug),
          }))
          .map(cleanModel),
        skills: edu.skills.map(s => s.slug),
      })),
    }),
  },
  skill: {
    data: async tx => await tx.skill.findMany(),
    /* The calculated experience values should not be stored in JSON, because they will be
       recalculated during the seeding process. */
    jsonify: model => omit(cleanModel(model), 'calculatedExperience'),
  },
};
