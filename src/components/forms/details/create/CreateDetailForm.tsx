import { useMemo } from "react";

import { type Project, type DetailEntityType, type ApiDetail } from "~/prisma/model";
import { createDetail } from "~/actions/mutations/details";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateDetailFormProps
  extends Omit<GenericCreateDetailFormProps<ApiDetail<[], Project>>, "action" | "actions"> {
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
    <GenericCreateDetailForm<ApiDetail<[], Project>> action={createDetailForEntity} {...props} />
  );
};

export default CreateDetailForm;
