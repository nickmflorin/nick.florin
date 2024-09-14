import type { BrandProject } from "~/prisma/model";

import { classNames } from "~/components/types";

import { Link, type LinkProps } from "./generic";

export type ProjectLinkProps = Omit<LinkProps<"link">, "children" | "href"> & {
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
    element="a"
    className={classNames("text-blue-900", props.className)}
    href={`/projects/${project.slug}`}
  >
    {useAbbreviatedName ? (project.shortName ?? project.name) : project.name}
  </Link>
);
