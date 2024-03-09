import { useMemo } from "react";

import { type DetailEntityType, type FullDetail } from "~/prisma/model";
import { createDetail } from "~/actions/create-detail";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateDetailFormProps
  extends Omit<GenericCreateDetailFormProps<FullDetail>, "action" | "actions"> {
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

  return <GenericCreateDetailForm<FullDetail> action={createDetailForEntity} {...props} />;
};

export default CreateDetailForm;
