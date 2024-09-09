"use client";
import { deleteExperiences } from "~/actions/mutations/experiences";

/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteExperiences(ids)} />
);

export default DeleteManyButton;
