import "server-only";

import {
  type DetailEntityType,
  type DetailEntity,
  type ApiDetail,
  type DetailIncludes,
} from "~/database/model";

import { fetchDetails } from "~/actions/details/fetch-details";
import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions/fetches";
import { getEntity } from "~/actions/get-entity";
import type { DetailsControls, DetailsFilters } from "~/actions/types";
import { ApiClientGlobalError } from "~/api";

export const fetchEntityDetails = <T extends DetailEntityType, I extends DetailIncludes>(
  includes: I,
  entityType: T,
) =>
  standardDetailFetchAction(
    async (
      id,
      params: Omit<
        DetailsControls<I, Omit<DetailsFilters, "entityIds" | "entityTypes">>,
        "includes"
      >,
      { isAdmin },
    ): StandardFetchActionReturn<{ details: ApiDetail<I>[]; entity: DetailEntity<T> }> => {
      const entity: DetailEntity<T> | null = await getEntity(id, entityType);
      if (!entity) {
        return ApiClientGlobalError.NotFound({
          message: "The entity could not be found.",
        });
      } else if (!isAdmin && !entity.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      const fetcher = fetchDetails(includes);
      const { data: details, error } = await fetcher(
        {
          ...params,
          filters: { ...params.filters, entityIds: [entity.id], entityTypes: [entityType] },
        },
        { strict: false, scope: "api", serialized: false },
      );
      if (error) {
        return error;
      }
      return { details, entity };
    },
    { authenticated: true, adminOnly: true },
  );
