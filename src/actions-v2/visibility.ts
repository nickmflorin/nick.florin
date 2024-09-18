export type ActionVisibility = "admin" | "public";

export const visibilityIsAdmin = (visibility?: ActionVisibility) => visibility === "admin";

export const visibilityIsPublic = (visibility?: ActionVisibility) => !visibilityIsAdmin(visibility);
