import { auth, getAuth } from "@clerk/nextjs/server";

import { ApiClientError } from "~/application/errors";
import { isPrismaDoesNotExistError, isPrismaInvalidIdError, prisma } from "~/prisma/client";
import { type User } from "~/prisma/model";

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
      return null;
    }
    throw e;
  }
}

type GetAuthUserOpts = {
  readonly strict?: boolean;
};

type GetAuthUserRt<O extends GetAuthUserOpts> = O extends { strict: false } ? User | null : User;

export const getAuthAdminUserFromRequest = async <O extends GetAuthUserOpts>(
  req: Parameters<typeof getAuth>[0],
  opts?: O,
): Promise<GetAuthUserRt<O>> => {
  const user = await getAuthUserFromRequest(req);
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    if (opts?.strict === false) {
      return null as GetAuthUserRt<O>;
    }
    throw ApiClientError.NotAuthenticated();
  } else if (!user.isAdmin) {
    if (opts?.strict === false) {
      return null as GetAuthUserRt<O>;
    }
    throw ApiClientError.Forbidden();
  }
  return user;
};

export const getAuthAdminUser = async () => {
  const user = await getAuthUser();
  /* Note: We may want to return the error in the response body in the future, for now this is
     fine - since it is not expected. */
  if (!user) {
    throw ApiClientError.NotAuthenticated();
  } else if (!user.isAdmin) {
    throw ApiClientError.Forbidden();
  }
  return user;
};
