"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import {
  type Project,
  type Transaction,
  type Detail,
  type User,
  type NestedDetail,
  type Skill,
} from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { ProjectSchema } from "~/api/schemas";

import { queryM2MsDynamically } from "../m2ms";

const UpdateProjectSchema = ProjectSchema.partial();

/* Note: Syncing the details with a project means removing the previously existing project that the
   Detail may have been associated with. */
const syncDetails = async (
  tx: Transaction,
  { project, details, user }: { project: Project; user: User; details?: Detail[] },
) => {
  if (details) {
    await tx.detail.updateMany({
      where: { id: { in: details.map(d => d.id) } },
      data: { projectId: project.id, updatedById: user.id },
    });
  }
};

/* Note: Syncing the nested details with a project means removing the previously existing project
   that the NestedDetail may have been associated with. */
const syncNestedDetails = async (
  tx: Transaction,
  {
    project,
    nestedDetails,
    user,
  }: { project: Project; user: User; nestedDetails?: NestedDetail[] },
) => {
  if (nestedDetails) {
    await tx.nestedDetail.updateMany({
      where: { id: { in: nestedDetails.map(d => d.id) } },
      data: { projectId: project.id, updatedById: user.id },
    });
  }
};

const syncSkills = async (
  tx: Transaction,
  { project, skills, user }: { project: Project; user: User; skills?: Skill[] },
) => {
  if (skills) {
    const relationships = await tx.projectOnSkills.findMany({
      where: { projectId: project.id },
    });
    /* We need to remove the relationship between the skill and the project if there is an
       existing relationship associated with the project but the project's ID is not included
       in the API request. */
    const toRemove = relationships.filter(r => !skills.map(e => e.id).includes(r.skillId));
    if (toRemove.length !== 0) {
      await Promise.all(
        toRemove.map(relationship =>
          tx.projectOnSkills.delete({
            where: {
              skillId_projectId: {
                skillId: relationship.skillId,
                projectId: relationship.projectId,
              },
            },
          }),
        ),
      );
    }
    /* We need to add relationships between an project and the skill if the project's ID is
       included in the API request and there is not an existing relationship between that
       project and the skill. */
    const toAdd = skills.filter(e => !relationships.some(r => r.skillId === e.id));
    if (toAdd.length !== 0) {
      await tx.projectOnSkills.createMany({
        data: toAdd.map(e => ({
          projectId: project.id,
          skillId: e.id,
          assignedById: user.id,
        })),
      });
    }
  }
};

export const updateProject = async (
  id: string,
  req: z.infer<typeof UpdateProjectSchema>,
): Promise<ApiClientErrorJson<keyof (typeof UpdateProjectSchema)["shape"]> | Project> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateProjectSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateProjectSchema).json;
  }

  return await prisma.$transaction(async tx => {
    let project: Project;
    try {
      project = await tx.project.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const parsed = UpdateProjectSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateProjectSchema).json;
    }

    const { slug, skills: _skills, details: _details, ...data } = parsed.data;

    const fieldErrors = new ApiClientFieldErrors();

    const currentName = data.name !== undefined ? data.name : project.name;
    const updateData = {
      ...data,
      slug: slug !== undefined && slug !== null ? slug : slugify(currentName),
    };

    const [details] = await queryM2MsDynamically(tx, {
      model: "detail",
      // It is important to cast to undefined if the details are not provided in the payload!
      ids: _details ? _details.filter(d => d.type === "detail").map(d => d.id) : undefined,
      fieldErrors,
    });
    const [nestedDetails] = await queryM2MsDynamically(tx, {
      model: "nestedDetail",
      // It is important to cast to undefined if the details are not provided in the payload!
      ids: _details ? _details.filter(d => d.type === "nestedDetail").map(d => d.id) : undefined,
      fieldErrors,
    });
    const [skills] = await queryM2MsDynamically(tx, {
      model: "skill",
      ids: _skills,
      fieldErrors,
    });

    if (!fieldErrors.isEmpty) {
      return fieldErrors.json;
    }

    if (!objIsEmpty(updateData)) {
      project = await tx.project.update({
        where: { id },
        data: {
          ...updateData,
          updatedById: user.id,
        },
      });
    }

    await syncDetails(tx, { project, details, user });
    await syncNestedDetails(tx, { project, nestedDetails, user });
    await syncSkills(tx, { project, skills, user });

    revalidatePath(`/admin/projects/${project.id}`, "page");
    revalidatePath("/api/projects");

    return project;
  });
};
