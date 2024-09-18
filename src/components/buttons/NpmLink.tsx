import { getNpmPackageUrl } from "~/database/model";

import { classNames } from "~/components/types";

import { Link, type LinkProps } from "./generic";

export type NpmLinkProps = Omit<LinkProps<"link">, "children" | "href" | "icon"> & {
  readonly npmPackageName: string;
};

export const NpmLink = ({ npmPackageName, ...props }: NpmLinkProps): JSX.Element => (
  <Link
    fontWeight="medium"
    fontSize="xs"
    {...props}
    element="a"
    className={classNames("font-mono tracking-tight text-github-black", props.className)}
    icon={{ name: "npm", iconStyle: "brands" }}
    iconSize="24px"
    iconClassName="text-npm-red"
    href={getNpmPackageUrl(npmPackageName)}
    openInNewTab
  >
    {npmPackageName}
  </Link>
);
