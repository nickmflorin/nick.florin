import { type BrandRepository } from '~/database/model';

import { NpmIconLink } from '~/components/buttons/NpmIconLink';
import { RepositoryLink } from '~/components/buttons/RepositoryLink';
import { type ComponentProps } from '~/components/types';
import { RepositoryText } from '~/features/repositories/components/RepositoryText';
import {
  ResumeSimpleTile,
  type ResumeSimpleTileProps,
} from '~/features/resume/components/tiles/ResumeSimpleTile';

export interface RepositoryTileProps extends Pick<
  ResumeSimpleTileProps,
  'iconSize' | keyof ComponentProps
> {
  readonly isDescriptionVisible?: boolean;
  readonly isLinkVisible?: boolean;
  readonly isNpmLinkVisible?: boolean;
  readonly repository: BrandRepository;
}

export const RepositoryTile = ({
  isDescriptionVisible = true,
  isLinkVisible = true,
  isNpmLinkVisible = true,
  repository,
  ...props
}: RepositoryTileProps) => (
  <ResumeSimpleTile
    iconSize={28}
    {...props}
    description={isDescriptionVisible ? repository.description : null}
    icon={{ iconStyle: 'brands', name: 'github' }}
    iconClassName='text-github-black'
  >
    {isLinkVisible ? (
      <RepositoryLink className='leading-[24px]' repository={repository} />
    ) : (
      <RepositoryText className='leading-[24px]' repository={repository} />
    )}
    {repository.npmPackageName && isNpmLinkVisible ? (
      <NpmIconLink iconSize='24px' npmPackageName={repository.npmPackageName} size='24px' />
    ) : null}
  </ResumeSimpleTile>
);
