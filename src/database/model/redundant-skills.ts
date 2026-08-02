import { uniqBy } from 'lodash-es';

import { type ApiEducation, type ApiExperience } from '~/database/model';

type ModelWithRedundantSkills =
  ApiEducation<['skills', 'details']> | ApiExperience<['skills', 'details']>;

/**
 * Performs manipulation of the {@link Skill} objects associated with an {@link Experience} or
 * {@link Education} model, their details, their {@link Detail}s' projects and nested details,
 * {@link NestedDetail[]}, such that the top level model (the {@link Experience} or
 * {@link Education}) does not contain references to {@link Skill} objects that are already included
 * in the {@link Detail}(s) or any of the {@link Detail}'s nested details, {@link NestedDetail[]}.
 *
 * Additionally, any {@link Skill} objects associated with a {@link Project} that is associated with
 * the {@link Detail} or {@link NestedDetail} will be included in the {@link Skill}(s) tied to that
 * specific {@link Detail} or {@link NestedDetail}.
 *
 * Before:
 * ------
 * - Skills:
 *   - Skill A (Redundant)
 *   - Skill B (Redundant)
 *   - Skill C
 * - Details:
 *   - Detail A
 *       - Skills:
 *         - Skill A
 *         - Skill D
 *     - Project
 *       - Skills:
 *         - Skill E (Moved to Detail Level)
 *         - Skill B (Moved to Detail Level)
 *
 * After:
 * -----
 * - Skills:
 *   - Skill C
 * - Details:
 *   - Detail A
 *       - Skills:
 *         - Skill A
 *         - Skill D
 *         - Skill E
 *         - Skill B
 *
 * The top level model is returned with its redundant skills removed.
 */
export const removeRedundantTopLevelSkills = <T extends ModelWithRedundantSkills>(model: T): T => {
  type Det = (typeof model)['details'][number];
  type NestedDet = Det['nestedDetails'][number];
  type Sk = (typeof model)['skills'][number];

  const [details, skills]: [Det[], Sk[]] = [...model.details].reduce(
    (prev: [Det[], Sk[]], detail: Det): [Det[], Sk[]] => {
      const [nestedDetails, nestedSkills] = detail.nestedDetails.reduce(
        (nestedPrev: [NestedDet[], Sk[]], nestedDetail: NestedDet): [NestedDet[], Sk[]] => {
          const nestedDetailSkills = [
            ...nestedDetail.skills,
            ...(nestedDetail.project ? nestedDetail.project.skills : []),
          ];
          return [
            [
              ...nestedPrev[0],
              { ...nestedDetail, skills: uniqBy(nestedDetailSkills, sk => sk.id) },
            ],
            [...nestedPrev[1], ...nestedDetailSkills],
          ];
        },
        [[], []] as [NestedDet[], Sk[]],
      );
      const detailSkills = [...detail.skills, ...(detail.project ? detail.project.skills : [])];
      return [
        [...prev[0], { ...detail, nestedDetails, skills: uniqBy(detailSkills, sk => sk.id) }],
        [...prev[1], ...detailSkills, ...nestedSkills],
      ];
    },
    [[], []] as [Det[], Sk[]],
  );

  return {
    ...model,
    details,
    skills: model.skills.filter(sk => !skills.some(nsk => nsk.id === sk.id)),
  };
};
