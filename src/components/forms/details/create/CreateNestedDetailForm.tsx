import { useMemo } from "react";

import { type NestedApiDetail, type Project } from "~/prisma/model";
import { createNestedDetail } from "~/actions/mutations/details";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateNestedDetailFormProps
  extends Omit<GenericCreateDetailFormProps<NestedApiDetail<[], Project>>, "action" | "actions"> {
  readonly detailId: string;
}

export const CreateNestedDetailForm = ({
  detailId,
  ...props
}: CreateNestedDetailFormProps): JSX.Element => {
  const createDetailForParent = useMemo(() => createNestedDetail.bind(null, detailId), [detailId]);
  return (
    <GenericCreateDetailForm<NestedApiDetail<[], Project>>
      action={createDetailForParent}
      {...props}
    />
  );
};

export default CreateNestedDetailForm;
