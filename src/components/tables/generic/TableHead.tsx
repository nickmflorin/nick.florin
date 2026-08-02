import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface TableHeadProps extends ComponentProps {
  readonly children?: ReactNode;
}

export const TableHead = (props: TableHeadProps) => (
  <thead {...props} className={classNames('table__head', props.className)} />
);
