import { Pagination } from '@mantine/core';

import { classNames, type ComponentProps } from '~/components/types';

export interface PaginatorPlaceholderProps extends Pick<ComponentProps, 'className'> {}

export const PaginatorPlaceholder = (props: PaginatorPlaceholderProps) => (
  <Pagination className={classNames('paginator', props.className)} total={1} value={1} />
);
