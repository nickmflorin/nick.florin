"use client";
import { deleteSkills } from "~/actions/mutations/skills";

/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteSkills(ids)} />
);

export default DeleteManyButton;
