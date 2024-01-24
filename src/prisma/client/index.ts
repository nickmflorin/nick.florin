/*
This file should *only* be used for instantiating the PrismaClient.

Each instance of PrismaClient manages a connection pool, which means that a large number of clients
can exhaust the database connection limit. This applies to all database connectors.  As such, each
application should generally only need one instance of the PrismaClient.

See: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient
     /instantiate-prisma-client#the-number-of-prismaclient-instances-matters

NextJS supports hot reloading of changed files, which means that the module responsible for
exporting the PrismaClient will be refreshed constantly.  This can result in additional, unwanted
instances of PrismaClient in a development environment.

As a workaround, you can store PrismaClient as a global variable in development environments only,\
as global variables are not reloaded:

See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
     #prevent-hot-reloading-from-creating-new-instances-of-prismaclient
*/
// import "server-only";

import { PrismaClient as RootPrismaClient } from "@prisma/client";

import { logger } from "~/application/logger";
import { env } from "~/env.mjs";

import { ModelMetaDataMiddleware } from "./middleware";
import { getDatabaseUrl, type DatabaseParams } from "./urls";

export * from "./errors";

/**
 * Initializes and returns the {@link PrismaClient} based on configuration values stored as ENV
 * variables.
 *
 * @returns {{ xprisma: PrismaClientWithExtensions, prisma: PrismaClient }}
 */
export const initializePrismaClient = (params?: DatabaseParams) => {
  logger.info("Initializing Prisma Client");
  const url = getDatabaseUrl(params);
  const prisma = new RootPrismaClient({
    log: env.DATABASE_LOG_LEVEL,
    datasources: { db: { url } },
  });
  prisma.$use(ModelMetaDataMiddleware);
  return prisma;
};

export type PrismaClient = ReturnType<typeof initializePrismaClient>;

export let prisma: PrismaClient;

const globalPrisma = globalThis as unknown as { prisma: PrismaClient };

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    prisma = initializePrismaClient();
  } else {
    if (!globalPrisma.prisma) {
      prisma = initializePrismaClient();
      logger.info("Storing Globally Instantiated Prisma Client");
      globalPrisma.prisma = prisma;
    } else {
      prisma = globalPrisma.prisma;
    }
  }
}
