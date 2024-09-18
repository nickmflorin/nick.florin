"use server";
import { getAuth, auth } from "@clerk/nextjs/server";

import { type User } from "~/database/model";
import { prisma } from "~/database/prisma";
import { logger } from "~/internal/logger";

import { ApiClientGlobalError } from "~/api-v2";

import { CMS_USER_ORG_SLUG, CMS_USER_ORG_ROLE, USER_ADMIN_ROLE } from "./constants";

type StrictUserPayload = Readonly<{
  user: User;
  clerkUserId: string;
  isAdmin: boolean;
  error?: never;
}>;

type NullUserPayload = Readonly<{
  user?: never;
  clerkUserId?: never;
  isAdmin?: never;
  error: ApiClientGlobalError;
}>;

export async function getClerkUser(
  req?: Parameters<typeof getAuth>[0],
): Promise<{ userId: string | null; isAdmin: boolean }> {
  let userId: string | null;
  let orgSlug: string | null | undefined;
  let orgRole: string | null | undefined;
  if (req) {
    ({ userId, orgSlug, orgRole } = getAuth(req));
  } else {
    ({ userId, orgSlug, orgRole } = auth());
  }
  return {
    userId,
    isAdmin:
      orgSlug === CMS_USER_ORG_SLUG &&
      [CMS_USER_ORG_ROLE, USER_ADMIN_ROLE].includes(orgRole as string),
  };
}

type GetAuthedUserOpts = {
  readonly strict?: boolean;
  readonly request?: Parameters<typeof getAuth>[0];
};

type GetAuthedUserRT<O extends GetAuthedUserOpts> = O extends { strict: true }
  ? StrictUserPayload
  : StrictUserPayload | NullUserPayload;

export const getAuthedUser = async <O extends GetAuthedUserOpts>(
  opts?: O,
): Promise<GetAuthedUserRT<O>> => {
  const { userId: clerkUserId, isAdmin } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict !== true) {
      return { error: ApiClientGlobalError.NotAuthenticated({}) } as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated({});
  }
  const user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) {
    logger.error("The user exists in Clerk but does not have an associated user in the database.", {
      clerkUserId,
    });
    if (opts?.strict !== true) {
      return { error: ApiClientGlobalError.NotAuthenticated({}) } as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated({});
  }
  return { user, clerkUserId, isAdmin } as GetAuthedUserRT<O>;
};
