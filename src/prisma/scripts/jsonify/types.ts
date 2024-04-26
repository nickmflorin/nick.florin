import type { Brand } from "~/prisma/model";

export type JsonifiableModel = Extract<
  Brand,
  "school" | "company" | "skill" | "repository" | "project" | "profile"
>;
