import { getNpmPackageUrl } from "~/database/model";

import { classNames } from "~/components/types";

import { IconButton, type IconButtonProps } from "./generic";

export type NpmIconLinkProps = Omit<
  IconButtonProps<"a">,
  "children" | "href" | "icon" | "target" | "rel"
> & {
  readonly npmPackageName: string;
};

export const NpmIconLink = ({ npmPackageName, ...props }: NpmIconLinkProps): JSX.Element => (
  <IconButton.Transparent
    size="24px"
    iconSize="24px"
    {...props}
    element="a"
    className={classNames("text-npm-red", props.className)}
    icon={{ name: "npm", iconStyle: "brands" }}
    href={getNpmPackageUrl(npmPackageName)}
    openInNewTab
  />
);
