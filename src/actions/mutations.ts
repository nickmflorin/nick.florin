import { type ApiClientErrorJson } from "~/api";

export type MutationActionResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiClientErrorJson };
