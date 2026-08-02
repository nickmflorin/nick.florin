import dynamic from 'next/dynamic';
import { type JSX, type ReactNode } from 'react';

import { Loading } from '~/components/loading/Loading';
import { tableHasLoadingIndicator, type TableLoadingIndicator } from '~/components/tables/types';
import {
  classNames,
  type ComponentProps,
  parseDataAttributes,
  type QuantitativeSize,
} from '~/components/types';

const TableSkeleton = dynamic(() => import('./TableSkeleton').then(mod => mod.TableSkeleton));
const TableFeedbackState = dynamic(() =>
  import('./TableFeedbackState').then(mod => mod.TableFeedbackState),
);

export interface TableBodyProps extends ComponentProps {
  readonly cellSkeletons?: ReactNode[];
  readonly children?: ReactNode;
  readonly emptyContent?: JSX.Element | string;
  readonly errorContent?: JSX.Element | string;
  readonly errorMessage?: string;
  readonly errorTitle?: string;
  readonly hasNoResults?: boolean;
  readonly isEmpty?: boolean;
  readonly isError?: boolean;
  readonly isLoading?: boolean;
  readonly loadingIndicator?: TableLoadingIndicator;
  readonly noResultsContent?: JSX.Element | string;
  readonly numSkeletonColumns?: number;
  readonly numSkeletonRows?: number;
  readonly skeletonRowHeight?: QuantitativeSize<'px'>;
}

export const TableBody = ({
  cellSkeletons,
  children,
  emptyContent,
  errorContent,
  errorMessage,
  errorTitle,
  hasNoResults,
  isEmpty,
  isError,
  isLoading,
  loadingIndicator,
  noResultsContent,
  numSkeletonColumns,
  numSkeletonRows,
  skeletonRowHeight,
  ...props
}: TableBodyProps) => (
  <tbody
    {...props}
    {...parseDataAttributes({
      isLoading: isLoading && tableHasLoadingIndicator(loadingIndicator, 'fade-rows'),
    })}
    className={classNames('table__body', props.className)}
  >
    {isLoading && tableHasLoadingIndicator(loadingIndicator, 'skeleton') ? (
      <TableSkeleton
        cellSkeletons={cellSkeletons}
        component='fragment'
        numColumns={numSkeletonColumns}
        numRows={numSkeletonRows}
        rowHeight={skeletonRowHeight}
      />
    ) : (
      <Loading
        component='tr'
        isLoading={isLoading && tableHasLoadingIndicator(loadingIndicator, 'spinner')}
      >
        {isError ? (
          <TableFeedbackState
            as='tr'
            errorContent={errorContent}
            errorMessage={errorMessage}
            errorTitle={errorTitle}
            stateType='error'
          />
        ) : hasNoResults ? (
          <TableFeedbackState as='tr' noResultsContent={noResultsContent} stateType='no-results' />
        ) : isEmpty ? (
          <TableFeedbackState as='tr' emptyContent={emptyContent} stateType='empty' />
        ) : (
          children
        )}
      </Loading>
    )}
  </tbody>
);
