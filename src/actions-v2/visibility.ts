export type ActionVisibility = "admin" | "public";

export const visibilityIsAdmin = (visibility?: ActionVisibility) => visibility === "admin";

export const visibilityIsPublic = (visibility?: ActionVisibility) => !visibilityIsAdmin(visibility);

export const isVisible = (
  visibility: ActionVisibility,
  visible: boolean | null | undefined,
): boolean | undefined => {
  if (visibilityIsAdmin(visibility)) {
    return visible ?? undefined;
  }
  return true;
};
