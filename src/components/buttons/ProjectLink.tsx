import clsx from "clsx";

import type { BrandProject } from "~/prisma/model";
import { withoutOverridingClassName } from "~/components/types";

import { Link, type LinkFlexProps } from "./generic";

export type ProjectLinkProps = Omit<LinkFlexProps<"link">, "children" | "href" | "flex"> & {
  readonly project: BrandProject;
  readonly useAbbreviatedName?: boolean;
};

export const ProjectLink = ({
  project,
  useAbbreviatedName = false,
  ...props
}: ProjectLinkProps): JSX.Element => (
  <Link
    fontWeight="medium"
    fontSize="sm"
    {...props}
    flex
    as="a"
    className={clsx(
      withoutOverridingClassName("text-github-blue", props.className),
      props.className,
    )}
    href={`/projects/${project.slug}`}
  >
    {useAbbreviatedName ? project.shortName ?? project.name : project.name}
  </Link>
);
