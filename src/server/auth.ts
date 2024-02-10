import "server-only";

import { auth, getAuth } from "@clerk/nextjs/server";

import { prisma } from "~/prisma/client";
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
  return await prisma.user.findUniqueOrThrow({ where: { clerkId: userId } });
}
