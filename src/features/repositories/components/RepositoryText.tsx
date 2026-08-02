import { type JSX } from 'react';

import { type BrandRepository } from '~/database/model';

import { classNames } from '~/components/types';
import { Text, type TextProps } from '~/components/typography';

export type RepositoryTextProps = {
  readonly repository: BrandRepository;
} & Omit<TextProps<'div'>, 'children'>;

export const RepositoryText = ({ repository, ...props }: RepositoryTextProps): JSX.Element => (
  <Text
    fontSize='sm'
    fontWeight='medium'
    {...props}
    className={classNames('text-blue-900', props.className)}
    component='div'
  >
    {repository.slug}
  </Text>
);
