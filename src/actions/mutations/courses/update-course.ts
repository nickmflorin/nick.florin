"use server";
import { revalidatePath } from "next/cache";

import { type z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { objIsEmpty } from "~/lib";
import { slugify } from "~/lib/formatters";
import {
  isPrismaDoesNotExistError,
  isPrismaInvalidIdError,
  prisma,
  type Transaction,
} from "~/prisma/client";
import { type Course, type User, type Skill, type Education } from "~/prisma/model";
import { ApiClientFieldErrors, ApiClientGlobalError, type ApiClientErrorJson } from "~/api";
import { CourseSchema } from "~/api/schemas";

import { queryM2MsDynamically } from "../m2ms";

const UpdateCourseSchema = CourseSchema.partial();

const syncSkills = async (
  tx: Transaction,
  { course, skills, user }: { course: Course; user: User; skills?: Skill[] },
) => {
  if (skills) {
    const relationships = await tx.courseOnSkills.findMany({
      where: { courseId: course.id },
    });
    /* We need to remove the relationship between the skill and the course if there is an
       existing relationship associated with the course but the course's ID is not included
       in the API request. */
    const toRemove = relationships.filter(r => !skills.map(e => e.id).includes(r.skillId));
    if (toRemove.length !== 0) {
      await Promise.all(
        toRemove.map(relationship =>
          tx.courseOnSkills.delete({
            where: {
              skillId_courseId: {
                skillId: relationship.skillId,
                courseId: relationship.courseId,
              },
            },
          }),
        ),
      );
    }
    /* We need to add relationships between an course and the skill if the course's ID is
       included in the API request and there is not an existing relationship between that
       course and the skill. */
    const toAdd = skills.filter(e => !relationships.some(r => r.skillId === e.id));
    if (toAdd.length !== 0) {
      await tx.courseOnSkills.createMany({
        data: toAdd.map(e => ({
          courseId: course.id,
          skillId: e.id,
          assignedById: user.id,
        })),
      });
    }
  }
};

export const updateCourse = async (
  id: string,
  req: z.infer<typeof UpdateCourseSchema>,
): Promise<ApiClientErrorJson<keyof (typeof UpdateCourseSchema)["shape"]> | Course> => {
  const user = await getAuthAdminUser();

  const parsed = UpdateCourseSchema.safeParse(req);
  if (!parsed.success) {
    return ApiClientFieldErrors.fromZodError(parsed.error, UpdateCourseSchema).json;
  }

  return await prisma.$transaction(async tx => {
    let course: Course;
    try {
      course = await tx.course.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    const parsed = UpdateCourseSchema.safeParse(req);
    if (!parsed.success) {
      return ApiClientFieldErrors.fromZodError(parsed.error, UpdateCourseSchema).json;
    }

    const fieldErrors = new ApiClientFieldErrors();
    const {
      slug: _slug,
      skills: _skills,
      name: _name,
      education: _education,
      ...data
    } = parsed.data;

    const name = _name !== undefined ? _name : course.name;

    if (_name !== undefined && _name.trim() !== course.name.trim()) {
      if (await tx.course.count({ where: { name: _name, id: { notIn: [course.id] } } })) {
        fieldErrors.addUnique("name", "The name must be unique.");
        /* If the slug is being cleared, we have to make sure that the slugified version of the new
           name is still unique. */
      } else if (
        _slug === null &&
        (await tx.course.count({
          where: { slug: slugify(_name), id: { notIn: [course.id] } },
        }))
      ) {
        // Here, the slug should be provided explicitly, rather than cleared.
        fieldErrors.addUnique("name", "The name does not generate a unique slug.");
      }
    } else if (
      _slug === null &&
      (await tx.course.count({
        where: { slug: slugify(name), id: { notIn: [course.id] } },
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
      (await tx.course.count({ where: { slug: _slug, id: { notIn: [course.id] } } }))
    ) {
      fieldErrors.addUnique("slug", "The slug must be unique.");
    }

    let education: Education | null = null;
    if (_education) {
      education = await tx.education.findUnique({ where: { id: _education } });
      if (!education) {
        fieldErrors.addDoesNotExist("education", "The education does not exist.");
      }
    }

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
      educationId: education ? education.id : undefined,
      slug: _slug === undefined ? undefined : _slug === null ? slugify(name) : _slug.trim(),
      name: _name === undefined || _name.trim() === course.name.trim() ? undefined : _name.trim(),
    };

    if (!objIsEmpty(update)) {
      course = await tx.course.update({
        where: { id },
        data: {
          ...update,
          updatedById: user.id,
        },
      });
    }

    /* TODO: Uncomment when we build skills into the Course's form.
       await syncSkills(tx, { course, skills, user }); */

    revalidatePath("/admin/courses", "page");
    revalidatePath(`/api/courses/${course.id}`);
    return course;
  });
};
