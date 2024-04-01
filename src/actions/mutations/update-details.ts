"use server";
import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { DetailEntityType, type Detail } from "~/prisma/model";
import {
  ApiClientFormError,
  ApiClientGlobalError,
  parseZodError,
  ApiClientFieldErrors,
  ApiClientFieldErrorCodes,
} from "~/api";
import { DetailSchema } from "~/api/schemas";

import { getEntity } from "../fetches/get-entity";

const ExistingSchema = DetailSchema.partial({ label: true }).extend({ id: z.string().uuid() });
const NewSchema = DetailSchema;

const UpdateDetailsSchema = z.object({
  details: z.array(z.union([ExistingSchema, NewSchema])),
});

// Not being currently used, but is left here just in case we wind up needing it in the near future.
export const updateDetails = async (
  entityId: string,
  entityType: DetailEntityType,
  req: z.infer<typeof UpdateDetailsSchema>,
) => {
  const user = await getAuthAdminUser();

  const fieldErrors = new ApiClientFieldErrors();
  let existingDetails: z.infer<typeof ExistingSchema>[] = [];
  let newDetails: z.infer<typeof NewSchema>[] = [];

  const entity = getEntity(entityId, entityType);
  if (!entity) {
    throw ApiClientGlobalError.NotFound("No entity exists for the provided ID and entity type.");
  }

  const result = await prisma.$transaction(async tx => {
    for (let i = 0; i < req.details.length; i++) {
      const detail = req.details[i];

      const parsedExisting = ExistingSchema.safeParse(detail);
      const parsedNew = NewSchema.safeParse(detail);
      if (parsedExisting.success) {
        const { label, id, ...rest } = parsedExisting.data;
        let existing: Detail;
        try {
          existing = await tx.detail.findUniqueOrThrow({ where: { id, entityType, entityId } });
        } catch (e) {
          if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
            logger.error(
              `The detail with ID '${id}' does not belong to entity with ID '${entityId}', ` +
                `entity type '${entityType}', and thus cannot be updated.`,
              { entityType, entityId, id },
            );
            throw ApiClientGlobalError.BadRequest(
              "The detail does not exist for the given entity type and entity id.",
            );
          }
          throw e;
        }
        if (
          label &&
          existing.label !== label &&
          (await tx.detail.count({ where: { entityId, entityType, label } }))
        ) {
          fieldErrors.add(`details.${i}.label`, {
            code: ApiClientFieldErrorCodes.unique,
            message: "The label must be unique for a given parent.",
          });
        } else {
          existingDetails = [...existingDetails, { ...rest, label, id }];
        }
      } else if (parsedNew.success) {
        newDetails = [...newDetails, parsedNew.data];
      } else if (z.object({ id: z.any() }).safeParse(detail).success) {
        /* At this point, we do not know if the detail is an existing detail or a new detail - we
           only know that the schema validation failed (i.e. the detail is not valid, regardless
           of whether it is an existing detail or a new detail).

           What we need to do is first check if there is an 'id' property, and use that to determine
           which schema the errors should be returned from. */
        const errs = parseZodError(parsedExisting.error, ExistingSchema);
        fieldErrors.add(
          Object.keys(errs).reduce(
            (acc, k) => ({ ...acc, [`details.${i}.${k}`]: errs[k as keyof typeof errs] }),
            {},
          ),
        );
      } else {
        const errs = parseZodError(parsedNew.error, NewSchema);
        fieldErrors.add(
          Object.keys(errs).reduce(
            (acc, k) => ({ ...acc, [`details.${i}.${k}`]: errs[k as keyof typeof errs] }),
            {},
          ),
        );
      }
    }
    if (Object.keys(fieldErrors).length) {
      return ApiClientFormError.BadRequest(fieldErrors).toJson();
    }
    return {
      created: await Promise.all(
        newDetails.map(({ project, ...detail }) =>
          tx.detail.create({
            data: {
              ...detail,
              createdById: user.id,
              updatedById: user.id,
              entityId,
              entityType,
              projectId: project,
            },
          }),
        ),
      ),
      updated: await Promise.all(
        existingDetails.map(({ project, ...detail }) =>
          tx.detail.update({
            where: { id: detail.id, entityId, entityType },
            data: { ...detail, updatedById: user.id, projectId: project },
          }),
        ),
      ),
    };
  });

  if (entityType === DetailEntityType.EDUCATION) {
    revalidatePath("/admin/education", "page");
    revalidatePath("/api/educations");
  } else {
    revalidatePath("/admin/experiences", "page");
    revalidatePath("/api/experiences");
  }
  return result;
};
