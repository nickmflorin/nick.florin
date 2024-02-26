import "server-only";

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
