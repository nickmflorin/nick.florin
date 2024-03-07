"use client";
import { useMemo, useState } from "react";

import { type NestedDetail } from "~/prisma/model";
import { createNestedDetail } from "~/actions/create-nested-detail";
import { Link } from "~/components/buttons";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateNestedDetailFormProps
  extends Omit<
    GenericCreateDetailFormProps<NestedDetail>,
    "action" | "actions" | "onCreate" | "onFailure" | "onSuccess"
  > {
  readonly detailId: string;
}

export const CreateNestedDetailForm = ({
  detailId,
  ...props
}: CreateNestedDetailFormProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);
  const createDetailForParent = useMemo(() => createNestedDetail.bind(null, detailId), [detailId]);
  return (
    <GenericCreateDetailForm<NestedDetail>
      action={createDetailForParent}
      onCreate={() => setIsCreating(true)}
      onFailure={() => setIsCreating(false)}
      onSuccess={() => setIsCreating(false)}
      {...props}
      actions={[
        <Link.Primary
          options={{ as: "button" }}
          fontWeight="regular"
          type="submit"
          fontSize="xs"
          key="0"
          isLoading={isCreating}
        >
          Create
        </Link.Primary>,
      ]}
    />
  );
};

export default CreateNestedDetailForm;
