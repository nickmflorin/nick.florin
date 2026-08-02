import { type IconProp } from '~/components/icons';

export type LeadingPath = `/${string}`;

/**
 * The form that a single path-active check can take, used internally by {@link PathActive}.
 *
 * RegExp is not a serializable value, so it cannot be passed from Server Components to Client
 * Components. To alleviate this, the `{ leadingPath: string }` shape is included, which prompts a
 * RegExp to be created on the client from the `leadingPath` string.
 */
type _PathActive =
  | ((pathname: string) => boolean)
  | { endPath?: boolean; leadingPath: LeadingPath }
  | boolean
  | RegExp;

export type PathActive = _PathActive | _PathActive[];

export interface NavItem {
  readonly activePaths: PathActive;
  readonly icon?: IconProp;
  readonly path: LeadingPath;
}

export interface LabeledNavItem extends NavItem {
  readonly label: string;
}
