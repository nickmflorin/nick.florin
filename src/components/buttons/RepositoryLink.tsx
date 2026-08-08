import { type JSX } from 'react';

import { type BrandRepository, getRepositoryGithubUrl } from '~/database/model';

import { classNames } from '~/components/types';

import { Link, type LinkProps } from './generic';

export type RepositoryLinkProps = {
  readonly repository: Pick<BrandRepository, 'slug'>;
} & Omit<LinkProps<'link'>, 'children' | 'href'>;

export const RepositoryLink = ({ repository, ...props }: RepositoryLinkProps): JSX.Element => (
  <Link
    fontSize='sm'
    fontWeight='medium'
    {...props}
    className={classNames('text-blue-900', props.className)}
    element='a'
    href={getRepositoryGithubUrl(repository)}
    openInNewTab
  >
    {repository.slug}
  </Link>
);
