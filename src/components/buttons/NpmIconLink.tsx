import { type JSX } from 'react';

import { getNpmPackageUrl } from '~/database/model';

import { classNames } from '~/components/types';

import { IconButton, type IconButtonProps } from './generic';

export type NpmIconLinkProps = {
  readonly npmPackageName: string;
} & Omit<IconButtonProps<'a'>, 'children' | 'href' | 'icon' | 'rel' | 'target'>;

export const NpmIconLink = ({ npmPackageName, ...props }: NpmIconLinkProps): JSX.Element => (
  <IconButton.Transparent
    iconSize='24px'
    size='24px'
    {...props}
    className={classNames('text-npm-red', props.className)}
    element='a'
    href={getNpmPackageUrl(npmPackageName)}
    icon={{ iconStyle: 'brands', name: 'npm' }}
    openInNewTab
  />
);
