import { type Config } from 'tailwindcss';
import { type DefaultColors } from 'tailwindcss/types/generated/colors';

/**
 * The shape of the `theme` property of the Tailwind {@link Config}.
 *
 * Every property of the shape is optional, which allows each module that contributes a cohesive
 * portion of the theme to be validated against it while defining only the subset of theme keys that
 * it is responsible for.  Validating against it is what gives the resolver callbacks that a theme
 * value can be defined as their contextual types.
 */
export type ThemeConfig = NonNullable<Config['theme']>;

/**
 * The utilities that Tailwind provides to the resolver callbacks that a theme value can be defined
 * as, declared with concrete types so that the callbacks are safe under the type-aware lint rules.
 *
 * Tailwind's own `PluginUtils` declares `theme` as a method shorthand that returns `any`, which
 * causes every resolver that destructures and calls it to violate the `unbound-method` and
 * `no-unsafe-return` lint rules.  Interface merging cannot change the type of an existing member,
 * so the shape cannot be corrected with module augmentation; instead, a resolver annotates its
 * parameter with this interface.  Tailwind's `PluginUtils` is assignable to this narrower shape,
 * which keeps an annotated resolver assignable to the callback form that {@link ThemeConfig}
 * expects.
 *
 * The `theme` utility is declared to return a flat scale because the theme keys that are defined
 * with resolvers require flat `Record<string, string>` values, and a flat scale is also assignable
 * anywhere Tailwind accepts a nested one.
 */
export interface ThemePluginUtils {
  /**
   * Converts a screens scale into the corresponding set of breakpoint values.
   */
  readonly breakpoints: (screens: Record<string, string>) => Record<string, string>;
  /**
   * The default Tailwind color palette.
   */
  readonly colors: DefaultColors;
  /**
   * Resolves the portion of the theme at the given dot-separated path.
   */
  readonly theme: (path: string, defaultValue?: string) => Record<string, string>;
}
