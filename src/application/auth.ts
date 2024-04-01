import { auth, getAuth } from "@clerk/nextjs/server";

import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type User } from "~/prisma/model";
import { ApiClientGlobalError, type ApiClientGlobalErrorJson } from "~/api";

import { logger } from "./logger";

export const getAuthUserFromRequest = async (...args: Parameters<typeof getAuth>) => {
  const { userId } = getAuth(...args);
  if (!userId) {
    return null;
  }
  return await prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });
};

export async function getAuthUser(): Promise<User | null> {
  const { userId } = auth();
  if (!userId) {
    return null;
  }
  try {
    return await prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });
  } catch (e) {
    if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
      logger.error(
        "The user exists in Clerk but does not have an associated user in the database.",
        { clerkUserId: userId },
      );
      return null;
    }
    throw e;
  }
}

type GetAuthUserOpts = {
  readonly strict?: boolean;
};

type GetAuthUserRt<O extends GetAuthUserOpts> = O extends { strict: false }
  ? User | ApiClientGlobalErrorJson
  : User;

export const getAuthAdminUserFromRequest = async <O extends GetAuthUserOpts>(
  req: Parameters<typeof getAuth>[0],
  opts?: O,
): Promise<GetAuthUserRt<O>> => {
  const user = await getAuthUserFromRequest(req);
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    if (opts?.strict === false) {
      return ApiClientGlobalError.NotAuthenticated().json as GetAuthUserRt<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!user.isAdmin) {
    if (opts?.strict === false) {
      return ApiClientGlobalError.Forbidden().json as GetAuthUserRt<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  return user;
};

type GetAuthAdminUserOpts = {
  readonly strict?: boolean;
};

type GetAuthAdminUserRT<O extends GetAuthAdminUserOpts> = O extends { strict: false }
  ? User | null
  : User;

export const getAuthAdminUser = async <O extends GetAuthAdminUserOpts>(
  opts?: O,
): Promise<GetAuthAdminUserRT<O>> => {
  const user = await getAuthUser();
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    if (opts?.strict === false) {
      return null as GetAuthAdminUserRT<O>;
    }
    throw ApiClientGlobalError.NotAuthenticated();
  } else if (!user.isAdmin) {
    if (opts?.strict === false) {
      return null as GetAuthAdminUserRT<O>;
    }
    throw ApiClientGlobalError.Forbidden();
  }
  return user as GetAuthAdminUserRT<O>;
};
