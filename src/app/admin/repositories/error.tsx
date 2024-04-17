"use client";
import { ErrorView } from "~/components/views/ErrorView";

export default function Error() {
  return (
    <ErrorView>There was an error loading the repositories. Do not worry, we are on it.</ErrorView>
  );
}
