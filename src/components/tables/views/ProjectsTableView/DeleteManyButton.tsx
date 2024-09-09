"use client";
import { deleteProjects } from "~/actions/mutations/projects";
/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteProjects(ids)} />
);

export default DeleteManyButton;
