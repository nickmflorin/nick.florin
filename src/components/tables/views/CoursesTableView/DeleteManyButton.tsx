"use client";
import { deleteCourses } from "~/actions/mutations/courses";

/* eslint-disable-next-line max-len */
import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/generic/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteCourses(ids)} />
);

export default DeleteManyButton;
