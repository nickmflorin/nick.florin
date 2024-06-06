import clsx from "clsx";

import { getNpmPackageUrl } from "~/prisma/model/repository";

import { IconButton, type IconButtonProps } from "./generic";

export type NpmIconLinkProps = Omit<
  IconButtonProps<"a">,
  "children" | "href" | "flex" | "icon" | "target" | "rel"
> & {
  readonly npmPackageName: string;
};

export const NpmIconLink = ({ npmPackageName, ...props }: NpmIconLinkProps): JSX.Element => (
  <IconButton.Bare
    size="24px"
    iconSize="24px"
    {...props}
    as="a"
    className={clsx("text-npm-red", props.className)}
    icon={{ name: "npm", iconStyle: "brands" }}
    href={getNpmPackageUrl(npmPackageName)}
    target="_blank"
    rel="noopener noreferrer"
  />
);
