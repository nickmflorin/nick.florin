"use server";
import { getAuth, auth } from "@clerk/nextjs/server";

import { logger } from "~/internal/logger";
import { prisma } from "~/prisma/client";
import { type User } from "~/prisma/model";

import { ApiClientGlobalError } from "~/api";

import { CMS_USER_ORG_SLUG, CMS_USER_ORG_ROLE, USER_ADMIN_ROLE } from "./constants";

type StrictClerkUserPayload = Readonly<{ clerkUserId: string; hasCMSAccess: boolean }>;
type NullClerkUserPayload = Readonly<{ clerkUserId: null; hasCMSAccess: false }>;

const NULL_CLERK_USER_PAYLOAD: NullClerkUserPayload = { clerkUserId: null, hasCMSAccess: false };

type ClerkUserPayload = StrictClerkUserPayload | NullClerkUserPayload;

type StrictUserPayload = Readonly<{ user: User; clerkUserId: string; hasCMSAccess: boolean }>;
type NullUserPayload = Readonly<{ user: null; clerkUserId: null; hasCMSAccess: false }>;

const NULL_USER_PAYLOAD: NullUserPayload = { user: null, clerkUserId: null, hasCMSAccess: false };

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
      hasCMSAccess:
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
  const { clerkUserId, hasCMSAccess } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict === false) {
      return NULL_CLERK_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!hasCMSAccess) {
    if (opts?.strict === false) {
      return NULL_CLERK_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  return { clerkUserId, hasCMSAccess } as GetAuthedUserRT<O>;
};

type GetAuthedUserRT<O extends GetAuthedUserOpts> = O extends { strict: false }
  ? UserPayload
  : StrictUserPayload;

export const getAuthedUser = async <O extends GetAuthedUserOpts>(
  opts?: O,
): Promise<GetAuthedUserRT<O>> => {
  const { clerkUserId, hasCMSAccess } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!hasCMSAccess) {
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) {
    logger.error("The user exists in Clerk but does not have an associated user in the database.", {
      clerkUserId,
    });
    if (opts?.strict === false) {
      return NULL_USER_PAYLOAD as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  }
  return { user, clerkUserId, hasCMSAccess } as GetAuthedUserRT<O>;
};
