"use client";
import { deleteEducations } from "~/actions/mutations/delete-educations";

import { DeleteManyButton as RootDeleteManyButton } from "../../generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteEducations(ids)} />
);

export default DeleteManyButton;
