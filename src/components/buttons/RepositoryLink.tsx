import type { BrandRepository } from "~/database/model";
import { getRepositoryGithubUrl } from "~/database/model";

import { classNames } from "~/components/types";

import { Link, type LinkProps } from "./generic";

export type RepositoryLinkProps = Omit<LinkProps<"link">, "children" | "href"> & {
  readonly repository: BrandRepository;
};

export const RepositoryLink = ({ repository, ...props }: RepositoryLinkProps): JSX.Element => (
  <Link
    fontWeight="medium"
    fontSize="sm"
    {...props}
    element="a"
    className={classNames("text-blue-900", props.className)}
    href={getRepositoryGithubUrl(repository)}
    openInNewTab
  >
    {repository.slug}
  </Link>
);
