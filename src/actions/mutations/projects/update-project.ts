"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import {
  isPrismaDoesNotExistError,
  isPrismaInvalidIdError,
  prisma,
  type Transaction,
} from "~/prisma/client";
import {
  type Project,
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
    const existingDetails = await tx.detail.findMany({ where: { projectId: project.id } });

    const toRemove = existingDetails.filter(r => !details.some(d => d.id === r.id));
    const toAdd = details.filter(d => !existingDetails.some(ed => ed.id === d.id));

    if (toRemove.length !== 0) {
      logger.info(
        `Disassociating ${toRemove.length} details from project ${project.id} (name = ${project.name}).`,
        {
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toRemove.map(d => d.id) } },
        data: { projectId: null, updatedById: user.id },
      });
    }
    if (toAdd.length !== 0) {
      logger.info(
        `Associating ${toAdd.length} details with project ${project.id} (name = ${project.name}).`,
        {
          adding: toAdd.map(a => `${a.id} (label = '${a.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toAdd.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
    }
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
    const existingDetails = await tx.nestedDetail.findMany({ where: { projectId: project.id } });

    const toRemove = existingDetails.filter(r => !nestedDetails.some(d => d.id === r.id));
    const toAdd = nestedDetails.filter(d => !existingDetails.some(ed => ed.id === d.id));

    if (toRemove.length !== 0) {
      logger.info(
        `Disassociating ${toRemove.length} nested details from project ${project.id} ` +
          `(name = ${project.name}).`,
        {
          removing: toRemove.map(d => `${d.id} (name = '${d.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.nestedDetail.updateMany({
        where: { id: { in: toRemove.map(d => d.id) } },
        data: { projectId: null, updatedById: user.id },
      });
    }
    if (toAdd.length !== 0) {
      logger.info(
        `Associating ${toAdd.length} nested details with project ${project.id} ` +
          `(name = ${project.name}).`,
        {
          adding: toAdd.map(a => `${a.id} (label = '${a.label}')`),
          project: project.id,
          projectName: project.name,
        },
      );
      await tx.detail.updateMany({
        where: { id: { in: toAdd.map(d => d.id) } },
        data: { projectId: project.id, updatedById: user.id },
      });
    }
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

    const fieldErrors = new ApiClientFieldErrors();
    const { slug: _slug, skills: _skills, details: _details, name: _name, ...data } = parsed.data;

    const name = _name !== undefined ? _name : project.name;

    if (_name !== undefined && _name.trim() !== project.name.trim()) {
      if (await tx.project.count({ where: { name: _name, id: { notIn: [project.id] } } })) {
        fieldErrors.addUnique("name", "The name must be unique.");
        /* If the slug is being cleared, we have to make sure that the slugified version of the new
           name is still unique. */
      } else if (
        _slug === null &&
        (await tx.project.count({
          where: { slug: slugify(_name), id: { notIn: [project.id] } },
        }))
      ) {
        // Here, the slug should be provided explicitly, rather than cleared.
        fieldErrors.addUnique("name", "The name does not generate a unique slug.");
      }
    } else if (
      _slug === null &&
      (await tx.project.count({
        where: { slug: slugify(name), id: { notIn: [project.id] } },
      }))
    ) {
      /* Here, the slug should be provided explicitly, rather than cleared.  The error is shown in
         regard to the slug, not the name, because the slug is what is being cleared whereas the
         name remains unchanged. */
      fieldErrors.addUnique(
        "slug",
        "The name generates a non-unique slug, so the slug must be provided.",
      );
    } else if (
      _slug !== null &&
      _slug !== undefined &&
      (await tx.project.count({ where: { slug: _slug, id: { notIn: [project.id] } } }))
    ) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }

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

    const update = {
      ...data,
      slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
      name: _name === undefined || _name.trim() === project.name.trim() ? undefined : _name.trim(),
    };

    if (!objIsEmpty(update)) {
      project = await tx.project.update({
        where: { id },
        data: {
          ...update,
          updatedById: user.id,
        },
      });
    }

    /* TODO: Uncomment these when we build in details, nested details and skills into the Project's
       form.
       await syncDetails(tx, { project, details, user });
       await syncNestedDetails(tx, { project, nestedDetails, user });
       await syncSkills(tx, { project, skills, user }); */

    revalidatePath("/admin/projects", "page");
    revalidatePath("/api/projects");
    revalidatePath(`/api/projects/${project.id}`);
    revalidatePath(`/projects/${project.slug}`, "page");
    return project;
  });
};
