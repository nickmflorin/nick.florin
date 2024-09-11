import { getNpmPackageUrl } from "~/prisma/model/repository";

import { classNames } from "~/components/types";

import { Link, type LinkFlexProps } from "./generic";

export type NpmLinkProps = Omit<LinkFlexProps<"link">, "children" | "href" | "flex" | "icon"> & {
  readonly npmPackageName: string;
};

export const NpmLink = ({ npmPackageName, ...props }: NpmLinkProps): JSX.Element => (
  <Link
    fontWeight="medium"
    fontSize="xs"
    {...props}
    flex
    as="a"
    className={classNames("font-mono tracking-tight text-github-black", props.className)}
    icon={{ name: "npm", iconStyle: "brands" }}
    iconSize="24px"
    iconClassName="text-npm-red"
    href={getNpmPackageUrl(npmPackageName)}
    target="_blank"
    rel="noopener noreferrer"
  >
    {npmPackageName}
  </Link>
);
