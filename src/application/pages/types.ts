import { type IconProp } from "~/components/icons";

export type LeadingPath = `/${string}`;

/* RegExp is not a serializable value so it cannot be passed from Server Components to Client
   Components.  To alleviate this issue, we incorporate the { leadingPath: string } type, which will
   prompt a RegExp to be created on the client with the 'leadingPath' string. */
type _PathActive =
  | RegExp
  | boolean
  | ((pathname: string) => boolean)
  | { leadingPath: LeadingPath; endPath?: boolean };

export type PathActive = _PathActive | _PathActive[];

export interface NavItem {
  // TODO: Add support for allowing just an 'IconName' to be provided.
  readonly icon?: IconProp;
  readonly path: LeadingPath;
  readonly activePaths: PathActive;
}

export interface LabeledNavItem extends NavItem {
  readonly label: string;
}
