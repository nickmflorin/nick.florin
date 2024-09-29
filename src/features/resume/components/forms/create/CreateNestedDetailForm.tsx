import { useMemo } from "react";

import { type ApiNestedDetail } from "~/database/model";

import { createNestedDetail } from "~/actions-v2/details/create-nested-detail";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateNestedDetailFormProps
  extends Omit<GenericCreateDetailFormProps<ApiNestedDetail<["skills"]>>, "action" | "actions"> {
  readonly detailId: string;
}

export const CreateNestedDetailForm = ({
  detailId,
  ...props
}: CreateNestedDetailFormProps): JSX.Element => {
  const createDetailForParent = useMemo(() => createNestedDetail.bind(null, detailId), [detailId]);
  return (
    <GenericCreateDetailForm<ApiNestedDetail<["skills"]>>
      action={createDetailForParent}
      {...props}
    />
  );
};

export default CreateNestedDetailForm;
