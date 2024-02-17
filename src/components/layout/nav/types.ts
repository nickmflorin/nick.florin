import { type PathActive, pathIsActive } from "~/lib/paths";
import { type Path } from "~/lib/urls";
import { type ButtonVariant } from "~/components/buttons";
import { type IconProp } from "~/components/icons";

export interface NavItem {
  readonly icon?: IconProp;
  readonly path: Path;
  readonly active: PathActive;
}

export interface NavButtonItem extends NavItem {
  readonly label: string;
  readonly button?: ButtonVariant<"link">;
}

export const navItemIsActive = <N extends Pick<NavItem, "active" | "path">, C extends N>(
  { path, active, children }: N & { readonly children?: C[] },
  { pathname }: { pathname: string },
): boolean => {
  if (children === undefined || children.length === 0) {
    return pathIsActive(active, pathname);
  }
  const baseIsActive = navItemIsActive({ path, active }, { pathname });
  return baseIsActive || children.some(child => navItemIsActive(child, { pathname }));
};
