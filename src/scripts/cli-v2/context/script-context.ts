import {
  type User as ClerkUser,
  createClerkClient,
  type OrganizationMembership,
} from '@clerk/backend';

import { CMS_USER_ORG_ROLE, CMS_USER_ORG_SLUG, USER_ADMIN_ROLE } from '~/application/auth';
import { type User } from '~/database/model';
import { upsertUserFromClerk } from '~/database/model/user';
import { db } from '~/database/prisma';

import { environment } from '~/environment';

import { CliEnvironmentError } from './errors';

/**
 * The authenticated identity a command writes as.
 *
 * Every write the content machinery performs stamps an audit user, so a command that mutates
 * anything needs this resolved before it starts.
 */
export interface ScriptContext {
  readonly clerkUser: ClerkUser;
  readonly user: User;
}

export interface ScriptContextOptions {
  /**
   * Whether the Clerk user is written into the database when it is not already there.
   *
   * A command that seeds an empty database needs it; a command that only reads existing rows
   * should leave the table alone and fail loudly if the user is absent.
   */
  readonly upsertUser?: boolean;
}

const membershipHasAdminAccess = (membership: OrganizationMembership): boolean =>
  membership.organization.slug === CMS_USER_ORG_SLUG &&
  [CMS_USER_ORG_ROLE, USER_ADMIN_ROLE].includes(membership.role);

/**
 * Guards against running with production database credentials and development Clerk credentials at
 * the same time.
 *
 * The two halves come from different places: the database connection is pulled from `.env` by
 * Vercel's CLI, while the Clerk tokens in that same file are whichever environment was last pulled.
 * Pulling with `env:pull` rather than `env:pull:prod` therefore leaves development Clerk tokens
 * beside production database parameters, and a run in that state writes a development `clerkId`
 * onto a production `User` row — a corruption that is silent at the time and awkward to unpick
 * later.
 */
const assertCredentialsAgree = (secretKey: string): void => {
  const { NODE_ENV, VERCEL_ENV } = environment.pick(['NODE_ENV', 'VERCEL_ENV']);
  if (
    NODE_ENV === 'production' &&
    (VERCEL_ENV === 'development' || secretKey.startsWith('sk_test_'))
  ) {
    throw new CliEnvironmentError(
      'The database credentials look like production while the Clerk credentials look like ' +
        'development, which would store a development Clerk user against a production row. Run ' +
        "'pnpm env:pull:prod' before running this against production.",
    );
  }
};

/**
 * Resolves the authenticated identity a command writes as, verifying along the way that the Clerk
 * user is an administrator.
 *
 * The context is resolved before any transaction is opened, because it makes several network calls
 * to Clerk and holding row locks across them would keep them for the duration of the round trips.
 */
export const resolveScriptContext = async (opts?: ScriptContextOptions): Promise<ScriptContext> => {
  const { CLERK_SECRET_KEY } = environment.pick(['CLERK_SECRET_KEY']);
  if (CLERK_SECRET_KEY === undefined) {
    return environment.throwConfigurationError(
      'CLERK_SECRET_KEY',
      'The Clerk secret key is required to resolve the user a command writes as.',
    );
  }
  assertCredentialsAgree(CLERK_SECRET_KEY);

  const personalClerkId = process.env.SCRIPT_CONTEXT_CLERK_USER_ID;
  if (personalClerkId === undefined) {
    throw new CliEnvironmentError(
      "The 'SCRIPT_CONTEXT_CLERK_USER_ID' environment variable names the user a command writes " +
        'as, and it is not set.',
    );
  }
  /* The secret key is handed to the client explicitly rather than left to be read from the
     environment, so that the validation above is what the client is constructed from. */
  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

  const clerkUser = await clerk.users.getUser(personalClerkId);
  /* The endpoint paginates, so the memberships are on the 'data' property rather than the response
     itself. */
  const { data: memberships } = await clerk.users.getOrganizationMembershipList({
    userId: clerkUser.id,
  });
  if (!memberships.some(membershipHasAdminAccess)) {
    throw new CliEnvironmentError('The Clerk user must be an administrator to run this command.');
  }
  if (opts?.upsertUser === true) {
    return { clerkUser, user: await upsertUserFromClerk(db, clerkUser) };
  }
  return {
    clerkUser,
    user: await db.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } }),
  };
};
