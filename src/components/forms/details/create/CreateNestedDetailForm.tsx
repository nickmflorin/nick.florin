import { useMemo } from "react";

import { type NestedApiDetail } from "~/prisma/model";
import { createNestedDetail } from "~/actions/mutations/create-nested-detail";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateNestedDetailFormProps
  extends Omit<GenericCreateDetailFormProps<NestedApiDetail>, "action" | "actions"> {
  readonly detailId: string;
}

export const CreateNestedDetailForm = ({
  detailId,
  ...props
}: CreateNestedDetailFormProps): JSX.Element => {
  const createDetailForParent = useMemo(() => createNestedDetail.bind(null, detailId), [detailId]);
  return <GenericCreateDetailForm<NestedApiDetail> action={createDetailForParent} {...props} />;
};

export default CreateNestedDetailForm;
