import { useMemo } from "react";

import { type DetailEntityType, type FullApiDetail } from "~/prisma/model";
import { createDetail } from "~/actions/mutations/create-detail";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateDetailFormProps
  extends Omit<GenericCreateDetailFormProps<FullApiDetail>, "action" | "actions"> {
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
  return <GenericCreateDetailForm<FullApiDetail> action={createDetailForEntity} {...props} />;
};

export default CreateDetailForm;
