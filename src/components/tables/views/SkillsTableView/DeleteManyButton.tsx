"use client";
import { deleteSkills } from "~/actions/mutations/delete-skills";

import { DeleteManyButton as RootDeleteManyButton } from "../../generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteSkills(ids)} />
);

export default DeleteManyButton;
