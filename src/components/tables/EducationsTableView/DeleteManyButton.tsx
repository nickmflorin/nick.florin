"use client";
import { DeleteManyButton as RootDeleteManyButton } from "../DeleteManyButton";

export const DeleteManyButton = () => <RootDeleteManyButton action={ids => console.log(ids)} />;

export default DeleteManyButton;
