import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';
import { z } from 'zod';

import { EnvironmentNames, getEnvironmentNameUnsafe, type LogLevel, LogLevels } from './constants';
import { NextEnvironment } from './next-environment';
import { createCommaSeparatedArraySchema, StringBooleanFlagSchema } from './util';

const environmentName = getEnvironmentNameUnsafe({
  nodeEnvironment: process.env.NODE_ENV,
  vercelEnvironment: process.env.VERCEL_ENV,
});

/**
 * A schema that should be used in places where the value is a string that is required in
 * production/development environments, but cannot be defined in a test environment for purposes of
 * ensuring that behavior associated with the environment variable is not accidentally triggered
 * when tests are executing.
 */
const TestRestricted = <T>(v: T) =>
  environmentName === EnvironmentNames.TEST ? z.literal('').optional() : v;

export const PrismaLogLevels = enumeratedLiterals(['info', 'query', 'warn', 'error'] as const, {});
export type PrismaLogLevel = EnumeratedLiteralsMember<typeof PrismaLogLevels>;

const PrismaLogLevelSchema = createCommaSeparatedArraySchema({
  options: PrismaLogLevels.members,
  partTransformer: v => v.toLowerCase(),
});

export const environment = NextEnvironment.create(
  environmentName,
  {
    runtime: {
      ANALYZE_BUNDLE: process.env.ANALYZE_BUNDLE,
      APP_NAME_FORMAL: process.env.APP_NAME_FORMAL,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      DATABASE_LOG_LEVEL: process.env.DATABASE_LOG_LEVEL,
      FONT_AWESOME_KIT_TOKEN: process.env.FONT_AWESOME_KIT_TOKEN,
      GITHUB_USERNAME: process.env.GITHUB_USERNAME,
      LOGFLARE_API_KEY: process.env.LOGFLARE_API_KEY,
      LOGFLARE_SOURCE_TOKEN: process.env.LOGFLARE_SOURCE_TOKEN,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_GITHUB_PROFILE_PREFIX: process.env.NEXT_PUBLIC_GITHUB_PROFILE_PREFIX,
      NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
      NEXT_PUBLIC_PRETTY_LOGGING: process.env.NEXT_PUBLIC_PRETTY_LOGGING,
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      NODE_ENV: process.env.NODE_ENV,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_USER: process.env.POSTGRES_USER,
      SCRIPT_CONTEXT_CLERK_USER_ID: process.env.SCRIPT_CONTEXT_CLERK_USER_ID,
      SITE_URL: process.env.SITE_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    validators: {
      ANALYZE_BUNDLE: StringBooleanFlagSchema.optional(),
      APP_NAME_FORMAL: z.string(),
      BLOB_READ_WRITE_TOKEN: z.string(),
      CLERK_SECRET_KEY: {
        development: z.string().startsWith('sk_test'),
        local: z.string().startsWith('sk_test'),
        preview: z.string().startsWith('sk_test'),
        production: z.string().startsWith('sk_live'),
        test: z.literal('').optional(),
      }[environmentName],
      DATABASE_LOG_LEVEL: PrismaLogLevelSchema.optional(),
      FONT_AWESOME_KIT_TOKEN: z.string(),
      GITHUB_USERNAME: z.string(),
      LOGFLARE_API_KEY: {
        development: z.string(),
        local: z.string().optional(),
        preview: z.string(),
        production: z.string(),
        test: z.literal('').optional(),
      }[environmentName],
      LOGFLARE_SOURCE_TOKEN: {
        development: z.string(),
        local: z.string().optional(),
        preview: z.string(),
        production: z.string(),
        test: z.literal('').optional(),
      }[environmentName],
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string(),
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NODE_ENV === 'test' ? z.literal('') : z.string(),
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
      NEXT_PUBLIC_GITHUB_PROFILE_PREFIX: z.string().url(),
      NEXT_PUBLIC_LOG_LEVEL: z
        .union([
          z.literal(LogLevels.DEBUG),
          z.literal(LogLevels.ERROR),
          z.literal(LogLevels.INFO),
          z.literal(LogLevels.SILENT),
          z.literal(LogLevels.WARN),
        ] as [z.ZodLiteral<LogLevel>, z.ZodLiteral<LogLevel>, ...z.ZodLiteral<LogLevel>[]])
        .optional(),
      NEXT_PUBLIC_PRETTY_LOGGING: StringBooleanFlagSchema.optional(),
      NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
      NODE_ENV: z.enum(['development', 'test', 'production']),
      POSTGRES_DATABASE: TestRestricted(z.string().optional()),
      POSTGRES_HOST: TestRestricted(z.string().optional()),
      POSTGRES_PASSWORD: TestRestricted(z.string().optional()),
      POSTGRES_PRISMA_URL: TestRestricted(z.string().url().optional()),
      POSTGRES_URL_NON_POOLING: TestRestricted(z.string().url().optional()),
      POSTGRES_USER: TestRestricted(z.string().optional()),
      SCRIPT_CONTEXT_CLERK_USER_ID: {
        development: z.string().startsWith('user_'),
        local: z.string().startsWith('user_'),
        preview: z.string().startsWith('user_'),
        production: z.string().startsWith('user_'),
        test: z.literal('').optional(),
      }[environmentName],
      SITE_URL: z.string().url(),
      VERCEL_ENV: z.enum(['development', 'production', 'preview']),
    },
  },
  {
    errorMessage: {
      title:
        `Environment Configuration Error: VERCEL_ENV='${process.env.VERCEL_ENV}' ` +
        `NODE_ENV='${process.env.NODE_ENV}'`,
    },
  },
);
