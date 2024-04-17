"use client";
import { deleteRepositories } from "~/actions/mutations/repositories";
/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteRepositories(ids)} />
);

export default DeleteManyButton;
