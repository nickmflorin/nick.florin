"use client";
import { Paginator } from "~/components/pagination-v2/Paginator";

export interface Error {
  readonly searchParams: Record<string, string>;
}

export default function Error() {
  return <Paginator count={1} pageSize={1} page={1} />;
}
