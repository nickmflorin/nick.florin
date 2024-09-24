import { type useUser } from "@clerk/nextjs";

import * as constants from "./constants";

export type UserResource = NonNullable<ReturnType<typeof useUser>["user"]>;

export const clerkUserIsAdmin = (user: UserResource): boolean => {
  const memberships = user.organizationMemberships.filter(
    membership =>
      membership.organization.slug === constants.CMS_USER_ORG_SLUG &&
      (membership.role === constants.CMS_USER_ORG_ROLE ||
        membership.role === constants.USER_ADMIN_ROLE),
  );
  return memberships.length >= 1;
};
