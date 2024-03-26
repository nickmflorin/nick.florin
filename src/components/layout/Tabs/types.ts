import { type NavItem } from "~/hooks";

export type TabItem = NavItem & {
  readonly label: string;
};
