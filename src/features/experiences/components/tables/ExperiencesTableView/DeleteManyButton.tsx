"use client";
import { deleteExperiences } from "~/actions/mutations/experiences";

import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteExperiences(ids)} />
);

export default DeleteManyButton;
