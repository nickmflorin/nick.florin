export * from "./unreachable-case-error";

export const isError = (e: unknown): e is Error =>
  typeof e === "object" &&
  e !== null &&
  (e as Error).stack !== undefined &&
  (e as Error).message !== undefined;
