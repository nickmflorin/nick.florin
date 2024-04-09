import clsx from "clsx";

import type { BrandRepository } from "~/prisma/model";
import { getRepositoryGithubUrl } from "~/prisma/model/repository";
import { withoutOverridingClassName } from "~/components/types";

import { Link, type LinkFlexProps } from "./generic";

export type RepositoryLinkProps = Omit<
  LinkFlexProps<{ as: "link" }>,
  "children" | "href" | "flex"
> & {
  readonly repository: BrandRepository;
};

export const RepositoryLink = ({ repository, ...props }: RepositoryLinkProps): JSX.Element => (
  <Link
    fontWeight="medium"
    fontSize="sm"
    {...props}
    flex
    options={{ as: "a" }}
    className={clsx(
      withoutOverridingClassName("text-github-blue", props.className),
      props.className,
    )}
    href={getRepositoryGithubUrl(repository)}
  >
    {repository.slug}
  </Link>
);
