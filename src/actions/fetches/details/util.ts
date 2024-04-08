import { prisma } from "~/prisma/client";
import {
  type NestedApiDetail,
  type BrandSkill,
  type BrandDetail,
  type BrandProject,
  type DetailOnSkills,
  type ProjectOnSkills,
  type BrandNestedDetail,
  type NestedDetailOnSkills,
  type ApiDetail,
} from "~/prisma/model";
import { type Visibility } from "~/api/query";

type Det = BrandDetail & {
  readonly skills: DetailOnSkills[];
  readonly project: (BrandProject & { readonly skills: ProjectOnSkills[] }) | null;
  readonly nestedDetails?: (BrandNestedDetail & {
    readonly skills: NestedDetailOnSkills[];
    readonly project: (BrandProject & { readonly skills: ProjectOnSkills[] }) | null;
  })[];
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type RT<P extends Det> = P extends { nestedDetails: any }
  ? ApiDetail<["skills", "nestedDetails"]>
  : ApiDetail<["skills"]>;

export const includeSkills = <P extends Det>({
  detail: { project: _project, nestedDetails: _nestedDetails, skills: _skills, ...d },
  skills,
}: {
  detail: P;
  skills: BrandSkill[];
}): RT<P> => {
  const det: ApiDetail<["skills"]> = {
    ...d,
    project: _project
      ? {
          ..._project,
          skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
        }
      : null,
    /* Include skills for each Detail by identifying the skills in the overall set that have
       IDs in the Detail's skills array. */
    skills: skills.filter(sk => _skills.some(d => d.skillId === sk.id)),
  };

  if (_nestedDetails) {
    return {
      ...det,
      nestedDetails: _nestedDetails.map(
        ({ skills: _ndSkills, project: _nestedProject, ...nd }): NestedApiDetail<["skills"]> => ({
          ...nd,
          project: _nestedProject
            ? {
                ..._nestedProject,
                skills: skills.filter(sk => _nestedProject.skills.some(d => d.skillId === sk.id)),
              }
            : null,
          /* Include skills for each NestedDetail by identifying the skills in the overall set
           that have IDs in the NestedDetail's skills array. */
          skills: skills.filter(sk => _ndSkills.some(d => d.skillId === sk.id)),
        }),
      ),
    } as RT<P>;
  }
  return det as RT<P>;
};

const detailsHaveNested = (
  details: ApiDetail<[]>[] | ApiDetail<["nestedDetails"]>[],
): details is ApiDetail<["nestedDetails"]>[] =>
  details.length !== 0 &&
  (details as ApiDetail<["nestedDetails"]>[])[0].nestedDetails !== undefined;

const hasNested = (
  detail:
    | ApiDetail<[]>
    | ApiDetail<["nestedDetails"]>
    | (ApiDetail<[]> | ApiDetail<["nestedDetails"]>)[],
): detail is ApiDetail<["nestedDetails"]> | ApiDetail<["nestedDetails"]>[] =>
  Array.isArray(detail)
    ? detailsHaveNested(detail)
    : (detail as ApiDetail<["nestedDetails"]>).nestedDetails !== undefined;

export const getDetailSkills = async (
  details:
    | ApiDetail<[]>
    | ApiDetail<["nestedDetails"]>
    | (ApiDetail<[]> | ApiDetail<["nestedDetails"]>)[],
  { visibility }: { visibility?: Visibility },
) => {
  const projects = [...(Array.isArray(details) ? details : [details])]
    .reduce(
      (prev: (BrandProject | null)[], curr: ApiDetail<[]> | ApiDetail<["nestedDetails"]>) => [
        ...prev,
        curr.project,
        ...((curr as ApiDetail<["nestedDetails"]>).nestedDetails ?? []).map(nd => nd.project),
      ],
      [],
    )
    .filter((p): p is BrandProject => p !== null);
  return await prisma.skill.findMany({
    where: {
      AND: [
        { visible: visibility === "public" ? true : undefined },
        {
          OR: [
            {
              details: {
                some: {
                  detailId: { in: Array.isArray(details) ? details.map(d => d.id) : [details.id] },
                },
              },
            },
            { projects: { some: { projectId: { in: projects.map(p => p.id) } } } },
            {
              nestedDetails: hasNested(details)
                ? {
                    some: {
                      nestedDetailId: {
                        in: (Array.isArray(details) ? details : [details]).flatMap(det =>
                          det.nestedDetails.map(d => d.id),
                        ),
                      },
                    },
                  }
                : undefined,
            },
          ],
        },
      ],
    },
  });
};

export const getNestedDetailSkills = async (
  details: NestedApiDetail<[]> | NestedApiDetail<[]>[],
  { visibility }: { visibility?: Visibility },
) => {
  const projects = [...(Array.isArray(details) ? details : [details])]
    .reduce(
      (prev: (BrandProject | null)[], curr: NestedApiDetail<[]>) => [...prev, curr.project],
      [],
    )
    .filter((p): p is BrandProject => p !== null);
  return await prisma.skill.findMany({
    where: {
      AND: [
        { visible: visibility === "public" ? true : undefined },
        {
          OR: [
            {
              nestedDetails: {
                some: {
                  nestedDetailId: {
                    in: Array.isArray(details) ? details.map(d => d.id) : [details.id],
                  },
                },
              },
            },
            { projects: { some: { projectId: { in: projects.map(p => p.id) } } } },
          ],
        },
      ],
    },
  });
};
