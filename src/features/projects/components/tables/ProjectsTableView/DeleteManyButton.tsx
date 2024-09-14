"use client";
import { deleteProjects } from "~/actions/mutations/projects";

import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteProjects(ids)} />
);

export default DeleteManyButton;
