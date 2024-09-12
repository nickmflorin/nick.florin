import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { z } from "zod";

import { getEnvironmentNameUnsafe, LogLevels, EnvironmentNames, type LogLevel } from "./constants";
import { NextEnvironment } from "./next-environment";
import { StringBooleanFlagSchema, createCommaSeparatedArraySchema } from "./util";

const environmentName = getEnvironmentNameUnsafe({
  nodeEnvironment: process.env.NODE_ENV,
  vercelEnvironment: process.env.VERCEL_ENV,
});

/* A schema that should be used in places where the value is a string that is required in
   production/development environments, but cannot be defined in a test environment for purposes
   of ensuring that behavior associated with the environment variable is not accidentally triggered
   when tests are executing. */
const TestRestricted = <T>(v: T) =>
  environmentName === EnvironmentNames.TEST ? z.literal("").optional() : v;

export const PrismaLogLevels = enumeratedLiterals(["info", "query", "warn", "error"] as const, {});
export type PrismaLogLevel = EnumeratedLiteralsMember<typeof PrismaLogLevels>;

const PrismaLogLevelSchema = createCommaSeparatedArraySchema({
  options: PrismaLogLevels.members,
  partTransformer: v => v.toLowerCase(),
});

export const environment = NextEnvironment.create(
  environmentName,
  {
    runtime: {
      /* ---------------------------- Server Environment Variables ---------------------------- */
      ANALYZE_BUNDLE: process.env.ANALYZE_BUNDLE,
      POSTGRES_URL: process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      DATABASE_LOG_LEVEL: process.env.DATABASE_LOG_LEVEL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      LOGFLARE_API_KEY: process.env.LOGFLARE_API_KEY,
      LOGFLARE_SOURCE_TOKEN: process.env.LOGFLARE_SOURCE_TOKEN,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      PERSONAL_CLERK_USER_ID: process.env.PERSONAL_CLERK_USER_ID,
      APP_NAME_FORMAL: process.env.APP_NAME_FORMAL,
      FONT_AWESOME_KIT_TOKEN: process.env.FONT_AWESOME_KIT_TOKEN,
      SITE_URL: process.env.SITE_URL,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      GITHUB_USERNAME: process.env.GITHUB_USERNAME,
      /* ---------------------------- Client Environment Variables ---------------------------- */
      NEXT_PUBLIC_PRETTY_LOGGING: process.env.NEXT_PUBLIC_PRETTY_LOGGING,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_GITHUB_PROFILE_PREFIX: process.env.NEXT_PUBLIC_GITHUB_PROFILE_PREFIX,
    },
    validators: {
      NEXT_PUBLIC_PRETTY_LOGGING: StringBooleanFlagSchema.optional(),
      NEXT_PUBLIC_LOG_LEVEL: z
        .union([
          z.literal(LogLevels.DEBUG),
          z.literal(LogLevels.ERROR),
          z.literal(LogLevels.INFO),
          z.literal(LogLevels.SILENT),
          z.literal(LogLevels.WARN),
        ] as [z.ZodLiteral<LogLevel>, z.ZodLiteral<LogLevel>, ...z.ZodLiteral<LogLevel>[]])
        .optional(),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NODE_ENV === "test" ? z.literal("") : z.string(),
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string(),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
      NEXT_PUBLIC_GITHUB_PROFILE_PREFIX: z.string().url(),
      GITHUB_USERNAME: z.string(),
      APP_NAME_FORMAL: z.string(),
      NODE_ENV: z.enum(["development", "test", "production"]),
      VERCEL_ENV: z.enum(["development", "production", "preview"]),
      BLOB_READ_WRITE_TOKEN: z.string(),
      SITE_URL: z.string().url(),
      ANALYZE_BUNDLE: StringBooleanFlagSchema.optional(),
      CLERK_SECRET_KEY: {
        test: z.literal("").optional(),
        development: z.string().startsWith("sk_test"),
        local: z.string().startsWith("sk_test"),
        preview: z.string().startsWith("sk_test"),
        production: z.string().startsWith("sk_live"),
      }[environmentName],
      PERSONAL_CLERK_USER_ID: {
        test: z.literal("").optional(),
        development: z.string().startsWith("user_"),
        local: z.string().startsWith("user_"),
        preview: z.string().startsWith("user_"),
        production: z.string().startsWith("user_"),
      }[environmentName],
      FONT_AWESOME_KIT_TOKEN: z.string(),
      LOGFLARE_SOURCE_TOKEN: {
        test: z.literal("").optional(),
        development: z.string(),
        local: z.string().optional(),
        preview: z.string(),
        production: z.string(),
      }[environmentName],
      LOGFLARE_API_KEY: {
        test: z.literal("").optional(),
        development: z.string(),
        local: z.string().optional(),
        preview: z.string(),
        production: z.string(),
      }[environmentName],
      /* ~~~~~~~~~~~~~~~~~~~~~~~~~ Database Configuration ~~~~~~~~~~~~~~~~~~~~~~~~~ */
      POSTGRES_URL: TestRestricted(z.string().url().optional()),
      POSTGRES_PRISMA_URL: TestRestricted(z.string().url().optional()),
      POSTGRES_URL_NON_POOLING: TestRestricted(z.string().url().optional()),
      POSTGRES_DATABASE: TestRestricted(z.string().optional()),
      POSTGRES_PASSWORD: TestRestricted(z.string().optional()),
      POSTGRES_USER: TestRestricted(z.string().optional()),
      POSTGRES_HOST: TestRestricted(z.string().optional()),
      DATABASE_LOG_LEVEL: PrismaLogLevelSchema.optional(),
    },
  },
  {
    errorMessage: {
      title: `Environment Configuration Error: VERCEL_ENV='${process.env.VERCEL_ENV}' NODE_ENV='${process.env.NODE_ENV}'`,
    },
  },
);
