import { omit } from 'lodash-es';
import { DateTime } from 'luxon';

import { DetailEntityType, type User } from '~/database/model';
import { type Transaction } from '~/database/prisma';
import { minDate, strictArrayLookup } from '~/lib';

import { type BrandSkill } from './brand';

type RecalculateSkillsReturnForm = 'experience' | 'skills';

type RecalculateSkillUnpersistOptions = {
  readonly persist: false;
  readonly returnAs?: RecalculateSkillsReturnForm;
  readonly user?: never;
};

type RecalculateSkillPersistOptions = {
  readonly persist?: true;
  readonly returnAs?: RecalculateSkillsReturnForm;
  readonly user: User;
};

type RecalculateSkillOptions = RecalculateSkillPersistOptions | RecalculateSkillUnpersistOptions;

type RecalculateSkillsResult<
  I extends string | string[],
  O extends RecalculateSkillOptions,
> = O extends { returnAs: 'experience' }
  ? I extends string[]
    ? Record<string, number>
    : number
  : I extends string[]
    ? BrandSkill[]
    : BrandSkill;

export const calculateSkillsExperience = async <
  I extends string | string[],
  O extends RecalculateSkillOptions,
>(
  tx: Transaction,
  ids: I,
  { persist = true, returnAs = 'skills', user }: O,
): Promise<RecalculateSkillsResult<I, O>> => {
  const _ids = Array.isArray(ids) ? ids : ([ids] as string[]);
  const skills = await tx.skill.findMany({
    include: {
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      courses: { include: { education: true }, orderBy: { education: { startDate: 'asc' } } },
      projects: { orderBy: { startDate: 'asc' } },
      repositories: { orderBy: { startDate: 'asc' } },
    },
    where: { id: { in: _ids } },
  });
  /* When looking at the relationship between a Skill and an Education and/or Experience, it is
     important to also account for the Detail(s) and NestedDetail(s) because both can also be
     associated with a Skill independently of the relationship between the Education/Experience
     they belong to and the same Skill.  In other words, there can be Skill(s) associated with a
     Detail or NestedDetail that are not associated with the Education or Experience that the Detail
     or NestedDetail belongs to.  In those cases, we want to include those indirectly related
     Education(s) and Experience(s) when calculating the oldest start date. */
  const details = await tx.detail.findMany({
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        { nestedDetails: { some: { skills: { some: { id: { in: _ids } } } } } },
      ],
    },
  });
  const educations = await tx.education.findMany({
    include: { skills: true },
    orderBy: { startDate: 'asc' },
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        {
          id: {
            in: details.filter(d => d.entityType === DetailEntityType.EDUCATION).map(d => d.id),
          },
        },
      ],
    },
  });
  const experiences = await tx.experience.findMany({
    include: { skills: true },
    orderBy: { startDate: 'asc' },
    where: {
      OR: [
        { skills: { some: { id: { in: _ids } } } },
        {
          id: {
            in: details.filter(d => d.entityType === DetailEntityType.EXPERIENCE).map(d => d.id),
          },
        },
      ],
    },
  });

  let mapped: Record<string, number> = {};
  let updated: BrandSkill[] = [];

  const readyToProcess = skills.map(sk => ({
    ...sk,
    educations: educations.filter(e => e.skills.some(s => s.id === sk.id)),
    experiences: experiences.filter(e => e.skills.some(s => s.id === sk.id)),
  }));

  for (const sk of readyToProcess) {
    if (sk.experience !== null && sk.experience > 0) {
      mapped = { ...mapped, [sk.id]: sk.experience };
      updated = [
        ...updated,
        {
          ...omit(sk, ['projects', 'educations', 'experiences', 'courses', 'repositories']),
          calculatedExperience: sk.experience,
        },
      ];
    } else {
      const oldestDate = minDate(
        strictArrayLookup(sk.educations, 0, {})?.startDate,
        strictArrayLookup(sk.experiences, 0, {})?.startDate,
        strictArrayLookup(sk.projects, 0, {})?.startDate,
        strictArrayLookup(sk.courses, 0, {})?.education.startDate,
        strictArrayLookup(sk.repositories, 0, {})?.startDate,
      );
      const experience = oldestDate
        ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), 'years').years)
        : 0;

      mapped = { ...mapped, [sk.id]: experience };
      updated = [
        ...updated,
        {
          ...omit(sk, ['projects', 'educations', 'experiences', 'courses', 'repositories']),
          calculatedExperience: experience,
        },
      ];
    }
  }

  if (persist) {
    if (user === undefined) {
      /* This should be prevented by TS externally to this function, but we have to ensure it is
         satisfied internally. */
      throw new TypeError(
        'The user must be provided as an option when persisting the results of the ' +
          "skill's calculation.",
      );
    }
    const persisted = await Promise.all(
      updated.map(sk =>
        tx.skill.update({
          data: { calculatedExperience: sk.calculatedExperience, updatedById: user.id },
          where: { id: sk.id },
        }),
      ),
    );
    if (returnAs === 'experience') {
      if (Array.isArray(ids)) {
        return mapped as RecalculateSkillsResult<I, O>;
      } else if (persisted.length !== 1) {
        throw new TypeError(
          'Unexpectedly encountered multiple persisted skills when persisting a single skill.',
        );
      }
      return persisted[0].calculatedExperience as RecalculateSkillsResult<I, O>;
    } else if (Array.isArray(ids)) {
      return persisted as RecalculateSkillsResult<I, O>;
    } else if (persisted.length !== 1) {
      throw new TypeError(
        'Unexpectedly encountered multiple persisted skills when persisting a single skill.',
      );
    }
    return persisted[0] as RecalculateSkillsResult<I, O>;
  } else if (returnAs === 'experience') {
    if (Array.isArray(ids)) {
      return mapped as RecalculateSkillsResult<I, O>;
    } else if (updated.length !== 1) {
      throw new TypeError(
        'Unexpectedly encountered multiple updated skills when updating a single skill.',
      );
    }
    return updated[0].calculatedExperience as RecalculateSkillsResult<I, O>;
  } else if (Array.isArray(ids)) {
    return updated as RecalculateSkillsResult<I, O>;
  } else if (updated.length !== 1) {
    throw new TypeError(
      'Unexpectedly encountered multiple updated skills when updating a single skill.',
    );
  }
  return updated[0] as RecalculateSkillsResult<I, O>;
};
