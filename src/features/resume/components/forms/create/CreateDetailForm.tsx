import { useMemo } from "react";

import { type DetailEntityType, type ApiDetail } from "~/database/model";

import { createDetail } from "~/actions-v2/details/create-detail";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateDetailFormProps
  extends Omit<GenericCreateDetailFormProps<ApiDetail<["skills"]>>, "action" | "actions"> {
  readonly entityId: string;
  readonly entityType: DetailEntityType;
}

export const CreateDetailForm = ({
  entityId,
  entityType,
  ...props
}: CreateDetailFormProps): JSX.Element => {
  const createDetailForEntity = useMemo(
    () => createDetail.bind(null, entityId, entityType),
    [entityId, entityType],
  );
  return (
    <GenericCreateDetailForm<ApiDetail<["skills"]>> action={createDetailForEntity} {...props} />
  );
};

export default CreateDetailForm;
