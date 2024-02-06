import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * @typedef CommaSeparatedArraySchemaOptions<V>
 * @type {object}
 * @property {(v: string) => string} partTransformer - an ID.
 * @property {readonly V[]} options - your name.
 * @template {string} V
 */

/**
 * @typedef CreateCommaSeparatedArraySchema<V>
 * @type {
 *   <V extends string>(params: CommaSeparatedArraySchemaOptions<V>):
 *     z.ZodEffects<z.ZodString, V[], V>;
 * }
 * @template {string} V
 */

/**
 * @type {CreateCommaSeparatedArraySchema}
 */
export const createCommaSeparatedArraySchema = params =>
  z
    .string()
    .transform((value, ctx) => {
      const parsed = value
        .split(",")
        .map(v => v.trim())
        .map(v => (params?.partTransformer ? params.partTransformer(v) : v));
      const invalid = parsed.filter(vi => !params.options.includes(vi));
      if (invalid.length !== 0) {
        invalid.map(inv => {
          ctx.addIssue({
            message: `The value '${inv}' is invalid. Must be one of ${params.options.join(",")}`,
            code: z.ZodIssueCode.invalid_enum_value,
            received: inv,
            options: [...params.options],
          });
        });
        return z.NEVER;
      }
      return /** @type {V[]} */ (parsed);
    })
    .optional();

/**
 * @type {z.ZodEffects<z.ZodString, Prisma.LogLevel[], Prisma.LogLevel>>}
 */
const PrismaLogLevelSchema = createCommaSeparatedArraySchema({
  options: ["info", "query", "warn", "error"],
  partTransformer: v => v.toLowerCase(),
});

/**
 * @type {z.ZodUnion<[
 *   z.ZodEffects<z.ZodType<true, z.ZodTypeDef, true>, boolean, true>,
 *   z.ZodEffects<z.ZodType<false, z.ZodTypeDef, false>, boolean, false>]
 * >}
 */
const StringBooleanFlagSchema = z.union([
  z.custom(val => typeof val === "string" && val.toLowerCase() === "true").transform(() => true),
  z.custom(val => typeof val === "string" && val.toLowerCase() === "false").transform(() => false),
]);

/**
 * @typedef {("test" | "local" | "development" | "production" | "preview")} EnvName
 */

/**
 * @typedef {("warn" | "fatal" | "error" | "info" | "debug" | "trace" | "silent")} LogLevel
 * @type {Record<EnvName, LogLevel>}
 */
const DEFAULT_LOG_LEVELS = {
  development: "debug",
  production: "info",
  test: "debug",
  local: "debug",
  development: "info",
  preview: "info",
};

/**
 * @type {Record<EnvName, boolean>}
 */
const DEFAULT_PRETTY_LOGGING = {
  development: false,
  production: false,
  preview: false,
  test: true,
  local: true,
};

/**
 * @type {Record<EnvName, boolean>}
 */
const DEFAULT_BUNDLE_ANALYZE = {
  development: false,
  production: false,
  preview: false,
  test: false,
  local: false,
};

const STRICT_OMISSION = z.literal("").optional();

const testRestricted = schema => {
  if (process.env.NODE_ENV === "test") {
    return STRICT_OMISSION;
  }
  return schema;
};

/**
 * @type {<T>(map: {[key in EnvName]: T}) => T}
 */
const environmentLookup = map => {
  if (process.env.VERCEL_ENV !== undefined) {
    return map[process.env.VERCEL_ENV];
  } else if (process.env.NODE_ENV === "test") {
    return map["test"];
  }
  return map.local;
};

export const env = createEnv({
  /* ------------------------------ Server Environment Variables -------------------------------- */
  server: {
    APP_NAME_FORMAL: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    PRETTY_LOGGING: StringBooleanFlagSchema.default(environmentLookup(DEFAULT_PRETTY_LOGGING)),
    ANALYZE_BUNDLE: StringBooleanFlagSchema.default(environmentLookup(DEFAULT_BUNDLE_ANALYZE)),
    CLERK_SECRET_KEY: environmentLookup({
      test: STRICT_OMISSION,
      development: z.string().startsWith("sk_test"),
      local: z.string().startsWith("sk_test"),
      preview: z.string().startsWith("sk_test"),
      production: z.string().startsWith("sk_live"),
    }),
    PERSONAL_CLERK_USER_ID: environmentLookup({
      test: STRICT_OMISSION,
      preview: z.string().startsWith("user_"),
      local: z.string().startsWith("user_"),
      development: z.string().startsWith("user_"),
      production: z.string().startsWith("user_"),
    }),
    /* ~~~~~~~~~~ Database Configuration ~~~~~~~ */
    DATABASE_URL: testRestricted(z.string().url().optional()),
    DATABASE_NAME: testRestricted(z.string().optional()),
    DATABASE_PASSWORD: testRestricted(z.string().optional()),
    DATABASE_USER: testRestricted(z.string().optional()),
    DATABASE_HOST: testRestricted(z.string().optional()),
    DATABASE_PORT: testRestricted(z.coerce.number().int().positive().optional()),
    DATABASE_LOG_LEVEL: PrismaLogLevelSchema.optional(),
    FONT_AWESOME_KIT_TOKEN: z.string(),
  },
  /* ------------------------------ Client Environment Variables -------------------------------- */
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NODE_ENV === "test"
        ? z.literal("")
        : z.string().startsWith(
            environmentLookup({
              development: "pk_test",
              production: "pk_live",
              preview: "pk_test",
              local: "pk_test",
            }),
          ),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
    NEXT_PUBLIC_LOG_LEVEL: z
      .union([
        z.literal("fatal"),
        z.literal("error"),
        z.literal("info"),
        z.literal("warn"),
        z.literal("debug"),
        z.literal("trace"),
        z.literal("silent"),
      ])
      .default(environmentLookup(DEFAULT_LOG_LEVELS)),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  },
  runtimeEnv: {
    /* ------------------------------ Server Environment Variables ------------------------------ */
    DATABASE_URL: process.env.DATABASE_URL,
    ANALYZE_BUNDLE: process.env.ANALYZE_BUNDLE,
    MIGRATE_DATABASE_URL: process.env.MIGRATE_DATABASE_URL,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_LOG_LEVEL: process.env.DATABASE_LOG_LEVEL,
    NODE_ENV: process.env.NODE_ENV,
    PRETTY_LOGGING: process.env.PRETTY_LOGGING,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    PERSONAL_CLERK_USER_ID: process.env.PERSONAL_CLERK_USER_ID,
    APP_NAME_FORMAL: process.env.APP_NAME_FORMAL,
    FONT_AWESOME_KIT_TOKEN: process.env.FONT_AWESOME_KIT_TOKEN,
    /* ------------------------------ Client Environment Variables ------------------------------ */
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    /* NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
       NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, */
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  onValidationError: error => {
    const message = error.issues
      .map(
        (issue, i) =>
          `${i + 1}. Error at path '${issue.path}' with code '${issue.code}': ${issue.message}`,
      )
      .join("\n");
    const divider = "-".repeat(32);
    /* eslint-disable-next-line no-console */
    console.error("\n" + [divider, "Environment Configuration Error", message, divider].join("\n"));
  },
});
