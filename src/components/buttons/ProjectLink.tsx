import { type JSX } from 'react';

import { type BrandProject } from '~/database/model';

import { classNames } from '~/components/types';

import { Link, type LinkProps } from './generic';

export type ProjectLinkProps = {
  readonly project: BrandProject;
  readonly shouldUseAbbreviatedName?: boolean;
} & Omit<LinkProps<'link'>, 'children' | 'href'>;

export const ProjectLink = ({
  project,
  shouldUseAbbreviatedName = false,
  ...props
}: ProjectLinkProps): JSX.Element => (
  <Link
    fontSize='sm'
    fontWeight='medium'
    {...props}
    className={classNames('text-blue-900', props.className)}
    element='a'
    href={`/projects/${project.slug}`}
  >
    {shouldUseAbbreviatedName ? (project.shortName ?? project.name) : project.name}
  </Link>
);
