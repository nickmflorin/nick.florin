"use client";
import { deleteEducations } from "~/actions/mutations/educations";

/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteEducations(ids)} />
);

export default DeleteManyButton;
