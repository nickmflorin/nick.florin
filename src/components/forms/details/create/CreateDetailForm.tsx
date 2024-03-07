"use client";
import { useMemo, useState } from "react";

import { type DetailEntityType, type FullDetail } from "~/prisma/model";
import { createDetail } from "~/actions/create-detail";
import { Link } from "~/components/buttons";

import {
  GenericCreateDetailForm,
  type GenericCreateDetailFormProps,
} from "./GenericCreateDetailForm";

export interface CreateDetailFormProps
  extends Omit<
    GenericCreateDetailFormProps<FullDetail>,
    "action" | "actions" | "onSuccess" | "onCreate" | "onFailure"
  > {
  readonly entityId: string;
  readonly entityType: DetailEntityType;
}

export const CreateDetailForm = ({
  entityId,
  entityType,
  ...props
}: CreateDetailFormProps): JSX.Element => {
  const [isCreating, setIsCreating] = useState(false);

  const createDetailForEntity = useMemo(
    () => createDetail.bind(null, entityId, entityType),
    [entityId, entityType],
  );

  return (
    <GenericCreateDetailForm<FullDetail>
      action={createDetailForEntity}
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

export default CreateDetailForm;
