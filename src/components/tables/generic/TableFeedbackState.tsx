import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { ErrorView } from '~/components/errors/ErrorView';
import { EmptyMessage } from '~/components/feedback/EmptyMessage';
import { type TableBodyProps } from '~/components/tables/generic/TableBody';
import { type TableBodyRowProps } from '~/components/tables/generic/TableBodyRow';
import { parseDataAttributes } from '~/components/types';

const TableBody = dynamic(() => import('./TableBody').then(mod => mod.TableBody));
const TableBodyCell = dynamic(() => import('./TableBodyCell').then(mod => mod.TableBodyCell));
const TableBodyRow = dynamic(() => import('./TableBodyRow').then(mod => mod.TableBodyRow));

export const TableFeedbackStateTypes = enumeratedLiterals(
  ['error', 'empty', 'no-results'] as const,
  {},
);
export type TableFeedbackStateType = EnumeratedLiteralsMember<typeof TableFeedbackStateTypes>;

export interface TableFeedbackStateRowProps extends TableBodyRowProps {
  readonly as: 'tr';
  readonly emptyContent?: JSX.Element | string;
  readonly errorContent?: JSX.Element | string;
  readonly errorMessage?: string;
  readonly errorTitle?: string;
  readonly noResultsContent?: JSX.Element | string;
  readonly stateType: TableFeedbackStateType;
}

export interface TableFeedbackStateBodyProps extends TableBodyProps {
  readonly as?: 'tbody';
  readonly emptyContent?: JSX.Element | string;
  readonly errorContent?: JSX.Element | string;
  readonly errorMessage?: string;
  readonly errorTitle?: string;
  readonly noResultsContent?: JSX.Element | string;
  readonly stateType: TableFeedbackStateType;
}

export type TableFeedbackStateProps = TableFeedbackStateBodyProps | TableFeedbackStateRowProps;

const TableFeedbackStates: Record<
  TableFeedbackStateType,
  (props: Omit<TableFeedbackStateProps, 'as' | 'stateType'>) => JSX.Element
> = {
  [TableFeedbackStateTypes.EMPTY]: ({ emptyContent }) => {
    if (emptyContent) {
      return <EmptyMessage>{emptyContent}</EmptyMessage>;
    }
    return <EmptyMessage>No data exists.</EmptyMessage>;
  },
  [TableFeedbackStateTypes.ERROR]: ({ errorContent, errorMessage, errorTitle }) => {
    if (errorContent) {
      if (typeof errorContent === 'string') {
        return <ErrorView title={errorTitle ?? 'Error'}>{errorContent}</ErrorView>;
      }
      return errorContent;
    }
    return (
      <ErrorView title={errorTitle ?? 'Error'}>
        {errorMessage ?? 'There was an error loading the table data.'}
      </ErrorView>
    );
  },
  [TableFeedbackStateTypes.NO_RESULTS]: ({ noResultsContent }) => {
    if (noResultsContent) {
      return <EmptyMessage>{noResultsContent}</EmptyMessage>;
    }
    return <EmptyMessage>No data exists for the search criteria.</EmptyMessage>;
  },
};

const TableFeedbackStateInner = ({ stateType, ...props }: Omit<TableFeedbackStateProps, 'as'>) => {
  const Component = TableFeedbackStates[stateType];
  return (
    <TableBodyCell colSpan={100} height='100px'>
      <div className='h-full w-full flex flex-col items-center justify-center'>
        <Component {...props} />
      </div>
    </TableBodyCell>
  );
};

export const TableFeedbackState = ({
  as = 'tbody',
  emptyContent,
  errorContent,
  errorMessage,
  errorTitle,
  noResultsContent,
  stateType,
  ...props
}: TableFeedbackStateProps) =>
  as === 'tbody' ? (
    <TableBody {...props}>
      <TableBodyRow {...parseDataAttributes({ feedback: true })}>
        <TableFeedbackStateInner
          {...props}
          emptyContent={emptyContent}
          errorContent={errorContent}
          errorMessage={errorMessage}
          errorTitle={errorTitle}
          noResultsContent={noResultsContent}
          stateType={stateType}
        />
      </TableBodyRow>
    </TableBody>
  ) : (
    <TableBodyRow {...props} {...parseDataAttributes({ feedback: true })}>
      <TableFeedbackStateInner
        emptyContent={emptyContent}
        errorContent={errorContent}
        errorMessage={errorMessage}
        errorTitle={errorTitle}
        noResultsContent={noResultsContent}
        stateType={stateType}
      />
    </TableBodyRow>
  );
