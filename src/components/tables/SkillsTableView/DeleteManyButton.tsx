"use client";
import { deleteSkills } from "~/actions/delete-skills";

import { DeleteManyButton as RootDeleteManyButton } from "../DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteSkills(ids)} />
);

export default DeleteManyButton;
