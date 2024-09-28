import { type ApiClientErrorJson } from "~/api-v2";

export type MutationActionResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiClientErrorJson };
