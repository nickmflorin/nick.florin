"use client";
import { deleteEducations } from "~/actions/mutations/educations";

import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteEducations(ids)} />
);

export default DeleteManyButton;