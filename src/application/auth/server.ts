"use server";
import { getAuth, auth } from "@clerk/nextjs/server";

import { type User } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { ApiClientGlobalError } from "~/api";

import { CMS_USER_ORG_SLUG, CMS_USER_ORG_ROLE, USER_ADMIN_ROLE } from "./constants";

type StrictClerkUserPayload = Readonly<{ clerkUserId: string; isAdmin: boolean }>;
type NullClerkUserPayload = Readonly<{ clerkUserId: null; isAdmin: false }>;

const NULL_CLERK_USER_PAYLOAD: NullClerkUserPayload = { clerkUserId: null, isAdmin: false };

type ClerkUserPayload = StrictClerkUserPayload | NullClerkUserPayload;

type StrictUserPayload = Readonly<{ user: User; clerkUserId: string; isAdmin: boolean }>;
type NullUserPayload = Readonly<{ user: null; clerkUserId: null; isAdmin: false }>;

const NULL_USER_PAYLOAD: NullUserPayload = { user: null, clerkUserId: null, isAdmin: false };

type UserPayload = StrictUserPayload | NullUserPayload;

export async function getClerkUser(req?: Parameters<typeof getAuth>[0]): Promise<ClerkUserPayload> {
  let userId: string | null | undefined;
  let orgSlug: string | null | undefined;
  let orgRole: string | null | undefined;
  if (req) {
    ({ userId, orgSlug, orgRole } = getAuth(req));
  } else {
    ({ userId, orgSlug, orgRole } = auth());
  }
  if (userId) {
    return {
      clerkUserId: userId,
      isAdmin:
        orgSlug === CMS_USER_ORG_SLUG &&
        [CMS_USER_ORG_ROLE, USER_ADMIN_ROLE].includes(orgRole as string),
    };
  }
  return NULL_CLERK_USER_PAYLOAD;
}

type GetAuthedUserOpts = {
  readonly strict?: boolean;
  readonly request?: Parameters<typeof getAuth>[0];
};

type GetClerkAuthedUserRT<O extends GetAuthedUserOpts> = O extends { strict: false }
  ? ClerkUserPayload
  : StrictClerkUserPayload;

export const getClerkAuthedUser = async <O extends GetAuthedUserOpts>(
  opts?: O,
): Promise<GetClerkAuthedUserRT<O>> => {
  const { clerkUserId, isAdmin } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict === false) {
      return NULL_CLERK_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!isAdmin) {
    if (opts?.strict === false) {
      return NULL_CLERK_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  return { clerkUserId, isAdmin } as GetAuthedUserRT<O>;
};

type GetAuthedUserRT<O extends GetAuthedUserOpts> = O extends { strict: false }
  ? UserPayload
  : StrictUserPayload;

export const getAuthedUser = async <O extends GetAuthedUserOpts>(
  opts?: O,
): Promise<GetAuthedUserRT<O>> => {
  const { clerkUserId, isAdmin } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!isAdmin) {
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  const user = await db.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) {
    logger.error("The user exists in Clerk but does not have an associated user in the database.", {
      clerkUserId,
    });
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  }
  return { user, clerkUserId, isAdmin } as GetAuthedUserRT<O>;
};
