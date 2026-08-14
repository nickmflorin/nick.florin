import { type StrictValidator, type ValidationState } from 'typanion';
import { type z } from 'zod';

/**
 * Adapts a Zod schema into the validator shape Clipanion accepts for an option.
 *
 * Clipanion types its `validator` slot as a typanion `StrictValidator`, which is the only reason
 * typanion appears in this file at all — it arrives as one of Clipanion's own dependencies. Every
 * argument in the CLI is nonetheless described in Zod, so the repository keeps one schema language
 * rather than two, and an argument schema composes with the domain schemas it feeds.
 *
 * A schema that transforms its input is honored: the parsed value is registered as a Clipanion
 * coercion, so `--page=4` reaches the command as the number `4` rather than the string `'4'`.
 */
export const zodValidator = <T>(schema: z.ZodType<T>): StrictValidator<unknown, T> => {
  const test = (value: unknown, state?: ValidationState): value is T => {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        state?.errors?.push(`${state.p ?? '.'}: ${issue.message}`);
      }
      return false;
    }
    if (state?.coercion !== undefined && !Object.is(parsed.data, value)) {
      state.coercions?.push([state.p ?? '.', state.coercion.bind(null, parsed.data)]);
    }
    return true;
  };
  /* `StrictValidator` intersects the predicate with typanion's `Trait`, a phantom `__trait`
     property that exists only in the type system and is never present at runtime; typanion's own
     builders construct their validators by asserting it in exactly this way. */
  return test as StrictValidator<unknown, T>;
};
