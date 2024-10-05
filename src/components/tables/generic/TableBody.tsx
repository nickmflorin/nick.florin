import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import { Loading } from "~/components/loading/Loading";
import { tableHasLoadingIndicator, type TableLoadingIndicator } from "~/components/tables/types";
import {
  classNames,
  type QuantitativeSize,
  type ComponentProps,
  parseDataAttributes,
} from "~/components/types";

const TableSkeleton = dynamic(() => import("./TableSkeleton").then(mod => mod.TableSkeleton));
const TableFeedbackState = dynamic(() =>
  import("./TableFeedbackState").then(mod => mod.TableFeedbackState),
);

export interface TableBodyProps extends ComponentProps {
  readonly isLoading?: boolean;
  readonly isEmpty?: boolean;
  readonly isError?: boolean;
  readonly hasNoResults?: boolean;
  readonly emptyContent?: string | JSX.Element;
  readonly noResultsContent?: string | JSX.Element;
  readonly errorTitle?: string;
  readonly errorMessage?: string;
  readonly errorContent?: string | JSX.Element;
  readonly numSkeletonRows?: number;
  readonly numSkeletonColumns?: number;
  readonly cellSkeletons?: ReactNode[];
  readonly skeletonRowHeight?: QuantitativeSize<"px">;
  readonly loadingIndicator?: TableLoadingIndicator;
  readonly children?: ReactNode;
}

export const TableBody = ({
  children,
  isEmpty,
  isError,
  emptyContent,
  noResultsContent,
  hasNoResults,
  errorMessage,
  errorTitle,
  errorContent,
  isLoading,
  cellSkeletons,
  skeletonRowHeight,
  numSkeletonColumns,
  loadingIndicator,
  numSkeletonRows,
  ...props
}: TableBodyProps) => (
  <tbody
    {...props}
    {...parseDataAttributes({
      isLoading: isLoading && tableHasLoadingIndicator(loadingIndicator, "fade-rows"),
    })}
    className={classNames("table__body", props.className)}
  >
    {isLoading && tableHasLoadingIndicator(loadingIndicator, "skeleton") ? (
      <TableSkeleton
        component="fragment"
        numRows={numSkeletonRows}
        cellSkeletons={cellSkeletons}
        rowHeight={skeletonRowHeight}
        numColumns={numSkeletonColumns}
      />
    ) : (
      /* See comment towards the top of the file related to the overridden 'console.error'
         method. */
      <Loading
        component="tr"
        isLoading={isLoading && tableHasLoadingIndicator(loadingIndicator, "spinner")}
      >
        {isError ? (
          <TableFeedbackState
            as="tr"
            stateType="error"
            errorContent={errorContent}
            errorTitle={errorTitle}
            errorMessage={errorMessage}
          />
        ) : hasNoResults ? (
          <TableFeedbackState stateType="no-results" noResultsContent={noResultsContent} as="tr" />
        ) : isEmpty ? (
          <TableFeedbackState stateType="empty" emptyContent={emptyContent} as="tr" />
        ) : (
          children
        )}
      </Loading>
    )}
  </tbody>
);

export default TableBody;
