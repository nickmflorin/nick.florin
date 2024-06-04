import clsx from "clsx";

import { getNpmPackageUrl } from "~/prisma/model/repository";
import { withoutOverridingClassName } from "~/components/types";

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
    className={clsx(
      "font-mono tracking-tight",
      withoutOverridingClassName("text-github-black", props.className),
      props.className,
    )}
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
