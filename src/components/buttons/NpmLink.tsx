import { type JSX } from 'react';

import { getNpmPackageUrl } from '~/database/model';

import { classNames } from '~/components/types';

import { Link, type LinkProps } from './generic';

export type NpmLinkProps = {
  readonly npmPackageName: string;
} & Omit<LinkProps<'link'>, 'children' | 'href' | 'icon'>;

export const NpmLink = ({ npmPackageName, ...props }: NpmLinkProps): JSX.Element => (
  <Link
    fontSize='xs'
    fontWeight='medium'
    {...props}
    className={classNames('font-mono tracking-tight text-github-black', props.className)}
    element='a'
    href={getNpmPackageUrl(npmPackageName)}
    icon={{ iconStyle: 'brands', name: 'npm' }}
    iconClassName='text-npm-red'
    iconSize='24px'
    openInNewTab
  >
    {npmPackageName}
  </Link>
);
