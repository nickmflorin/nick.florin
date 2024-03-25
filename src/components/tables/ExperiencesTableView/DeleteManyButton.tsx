"use client";
import { deleteExperiences } from "~/actions/mutations/delete-experiences";

import { DeleteManyButton as RootDeleteManyButton } from "../DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteExperiences(ids)} />
);

export default DeleteManyButton;
