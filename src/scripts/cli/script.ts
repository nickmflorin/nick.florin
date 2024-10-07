import { db } from "~/database/prisma";
import { stdout } from "~/support";

import * as context from "./context";
import * as errors from "./errors";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Fn<A extends any[], R> = (...args: A) => R;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function inDevRestrictedEnv<A extends any[], R>(fn: Fn<A, R>): Fn<A, R> {
  return function (...args: A) {
    if (process.env.NODE_ENV !== "development") {
      throw new errors.CommandLineDevOnlyError();
    }
    return fn(...args);
  };
}

interface RunScriptOptions {
  readonly devOnly?: boolean;
  readonly upsertUser?: boolean;
}

export type Script = (context: context.ScriptContext) => Promise<void>;

export const runScript = async (fn: Script, opts?: RunScriptOptions) => {
  if (opts?.devOnly && process.env.NODE_ENV !== "development") {
    return stdout.error(new errors.CommandLineDevOnlyError());
  }

  const modified = async () => {
    const ctx = await context.getScriptContext({ upsertUser: opts?.upsertUser });
    await fn(ctx);
  };

  modified()
    .then(async () => {
      await db.$disconnect();
    })
    .catch(async e => {
      stdout.error(e);
      await db.$disconnect();
      process.exit(1);
    });
};
