'use server';
import { auth, getAuth } from '@clerk/nextjs/server';

import { type User } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

import { ApiClientGlobalError } from '~/api';

import { CMS_USER_ORG_ROLE, CMS_USER_ORG_SLUG, USER_ADMIN_ROLE } from './constants';

type StrictUserPayload = Readonly<{
  clerkUserId: string;
  error?: never;
  isAdmin: boolean;
  user: User;
}>;

type NullUserPayload = Readonly<{
  clerkUserId?: never;
  error: ApiClientGlobalError;
  isAdmin?: never;
  user?: never;
}>;

type ClerkAuthState = Readonly<{
  orgRole: null | string | undefined;
  orgSlug: null | string | undefined;
  userId: null | string;
}>;

/**
 * Returns the signed-in user's org role, org slug, and user id from Clerk.
 *
 * Uses the request-bound {@link getAuth} helper when a request is provided, since it remains
 * synchronous in Clerk v6+, and falls back to the context-based {@link auth} helper otherwise,
 * since it is asynchronous.
 *
 * @param {Parameters<typeof getAuth>[0]} req The request to derive the auth state from, if any.
 *
 * @returns {Promise<ClerkAuthState>} The signed-in user's org role, org slug, and user id.
 */
const getClerkAuthState = async (req?: Parameters<typeof getAuth>[0]): Promise<ClerkAuthState> =>
  req ? getAuth(req) : await auth();

export async function getClerkUser(
  req?: Parameters<typeof getAuth>[0],
): Promise<{ isAdmin: boolean; userId: null | string }> {
  const { orgRole, orgSlug, userId } = await getClerkAuthState(req);
  return {
    isAdmin:
      orgSlug === CMS_USER_ORG_SLUG &&
      [CMS_USER_ORG_ROLE, USER_ADMIN_ROLE].includes(orgRole as string),
    userId,
  };
}

type GetAuthedUserOpts = {
  readonly request?: Parameters<typeof getAuth>[0];
  readonly strict?: boolean;
};

type GetAuthedUserRT<O extends GetAuthedUserOpts> = O extends { strict: true }
  ? StrictUserPayload
  : NullUserPayload | StrictUserPayload;

export const getAuthedUser = async <O extends GetAuthedUserOpts>(
  opts?: O,
): Promise<GetAuthedUserRT<O>> => {
  const { isAdmin, userId: clerkUserId } = await getClerkUser(opts?.request);
  if (!clerkUserId) {
    if (opts?.strict !== true) {
      return { error: ApiClientGlobalError.NotAuthenticated({}) } as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated({});
  }
  const user = await db.user.findUnique({ where: { clerkId: clerkUserId } });
  if (!user) {
    logger.error('The user exists in Clerk but does not have an associated user in the database.', {
      clerkUserId,
    });
    if (opts?.strict !== true) {
      return { error: ApiClientGlobalError.NotAuthenticated({}) } as GetAuthedUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated({});
  }
  return { clerkUserId, isAdmin, user } as GetAuthedUserRT<O>;
};
