"use client";
import { deleteRepositories } from "~/actions/mutations/repositories";

import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteRepositories(ids)} />
);

export default DeleteManyButton;
