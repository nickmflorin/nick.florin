"use client";
import { deleteCourses } from "~/actions/mutations/courses";

import { DeleteManyButton as RootDeleteManyButton } from "~/components/tables/DeleteManyButton";

export const DeleteManyButton = () => (
  <RootDeleteManyButton action={async ids => await deleteCourses(ids)} />
);

export default DeleteManyButton;
