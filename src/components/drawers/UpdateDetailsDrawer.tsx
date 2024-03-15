"use client";
import { useMemo } from "react";

import { isUuid } from "~/lib/typeguards";
import { type Education, DetailEntityType, type Experience } from "~/prisma/model";
import { ModifyDetailsView } from "~/components/forms/details/ModifyDetailsView";
import { ApiResponseView } from "~/components/views/ApiResponseView";
import { useDetails, useMutableParams } from "~/hooks";

import { ClientDrawer } from "./ClientDrawer";

interface UpdateDetailsDrawerProps<T extends DetailEntityType> {
  readonly entityType: T;
}

const QueryParams: { [key in DetailEntityType]: string } = {
  [DetailEntityType.EDUCATION]: "updateEducationDetailsId",
  [DetailEntityType.EXPERIENCE]: "updateExperienceDetailsId",
};

export const UpdatDetailsDrawer = <T extends DetailEntityType>({
  entityType,
}: UpdateDetailsDrawerProps<T>): JSX.Element => {
  const { params, clear } = useMutableParams();

  const entityId = useMemo(() => params.get(QueryParams[entityType]), [params, entityType]);

  const { data, isLoading, error } = useDetails(entityId, entityType, {
    keepPreviousData: true,
  });

  if (isUuid(entityId)) {
    return (
      <ClientDrawer onClose={() => clear("skillId")} className="overflow-y-scroll">
        <ApiResponseView error={error} isLoading={isLoading} data={data}>
          {obj => {
            const title = (obj as { education: Education }).education
              ? (obj as { education: Education }).education.major
              : (obj as { experience: Experience }).experience.title;
            return (
              <ModifyDetailsView
                title={title}
                details={obj.details}
                entityId={entityId}
                entityType={entityType}
              />
            );
          }}
        </ApiResponseView>
      </ClientDrawer>
    );
  }
  return <></>;
};

export default UpdatDetailsDrawer;
