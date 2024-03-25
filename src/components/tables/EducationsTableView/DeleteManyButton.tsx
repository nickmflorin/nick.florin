"use client";
import { deleteEducations } from "~/actions/mutations/delete-educations";

import { DeleteManyButton as RootDeleteManyButton } from "../DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteEducations(ids)} />
);

export default DeleteManyButton;
