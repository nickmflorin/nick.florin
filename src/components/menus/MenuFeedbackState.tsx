import { type JSX } from 'react';

import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { ErrorView } from '~/components/errors/ErrorView';
import { EmptyMessage } from '~/components/feedback/EmptyMessage';
import { classNames, type ComponentProps } from '~/components/types';

import { type MenuFeedbackProps } from './types';

export const MenuFeedbackStateTypes = enumeratedLiterals(
  ['error', 'empty', 'no-results'] as const,
  {},
);
export type MenuFeedbackStateType = EnumeratedLiteralsMember<typeof MenuFeedbackStateTypes>;

export interface MenuFeedbackStateProps
  extends ComponentProps, Omit<MenuFeedbackProps, 'feedbackClassName' | 'feedbackStyle'> {
  readonly children?: (JSX.Element | null)[] | JSX.Element | null;
}

const MenuFeedbackStates: Record<
  MenuFeedbackStateType,
  (
    props: Omit<MenuFeedbackStateProps, 'children' | 'hasNoResults' | 'isEmpty' | 'isError'>,
  ) => JSX.Element
> = {
  [MenuFeedbackStateTypes.EMPTY]: ({ emptyContent }) => {
    if (emptyContent) {
      return (
        <EmptyMessage className='gap-3' imageSize={36}>
          {emptyContent}
        </EmptyMessage>
      );
    }
    return (
      <EmptyMessage className='gap-3' imageSize={36}>
        No data exists.
      </EmptyMessage>
    );
  },
  [MenuFeedbackStateTypes.ERROR]: ({ errorContent, errorMessage, errorTitle }) => {
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
  [MenuFeedbackStateTypes.NO_RESULTS]: ({ noResultsContent }) => {
    if (noResultsContent) {
      return (
        <EmptyMessage className='gap-3' imageSize={36}>
          {noResultsContent}
        </EmptyMessage>
      );
    }
    return (
      <EmptyMessage className='gap-3' imageSize={36}>
        No data exists for the search criteria.
      </EmptyMessage>
    );
  },
};

const PrivateMenuFeedbackState = ({
  className,
  stateType,
  style,
  ...props
}: {
  readonly stateType: MenuFeedbackStateType;
} & Omit<MenuFeedbackStateProps, 'children' | 'hasNoResults' | 'isEmpty' | 'isError'>) => {
  const Component = MenuFeedbackStates[stateType];
  return (
    <div
      className={classNames(
        'h-full w-full flex flex-col items-center justify-center min-h-[100px]',
        className,
      )}
      style={style}
    >
      <Component {...props} />
    </div>
  );
};

export const MenuFeedbackState = ({
  children,
  hasNoResults,
  isEmpty,
  isError,
  ...props
}: MenuFeedbackStateProps) => {
  if (isError) {
    return <PrivateMenuFeedbackState stateType='error' {...props} />;
  } else if (hasNoResults) {
    return <PrivateMenuFeedbackState stateType='no-results' {...props} />;
  } else if (isEmpty) {
    return <PrivateMenuFeedbackState stateType='empty' {...props} />;
  }
  return <>{children}</>;
};
