import type { Brand } from "~/database/model";

export type JsonifiableModel = Extract<
  Brand,
  "school" | "company" | "skill" | "repository" | "project" | "profile"
>;
