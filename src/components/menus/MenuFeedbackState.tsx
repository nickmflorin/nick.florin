import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { ErrorView } from "~/components/errors/ErrorView";
import { EmptyMessage } from "~/components/feedback/EmptyMessage";
import { type ComponentProps, classNames } from "~/components/types";

import { type MenuFeedbackProps } from "./types";

export const MenuFeedbackStateTypes = enumeratedLiterals(
  ["error", "empty", "no-results"] as const,
  {},
);
export type MenuFeedbackStateType = EnumeratedLiteralsMember<typeof MenuFeedbackStateTypes>;

export interface MenuFeedbackStateProps
  extends ComponentProps,
    Omit<MenuFeedbackProps, "feedbackClassName" | "feedbackStyle"> {
  readonly children?: JSX.Element | null | (JSX.Element | null)[];
}

const MenuFeedbackStates: {
  [key in MenuFeedbackStateType]: (
    props: Omit<MenuFeedbackStateProps, "hasNoResults" | "isError" | "isEmpty" | "children">,
  ) => JSX.Element;
} = {
  [MenuFeedbackStateTypes.EMPTY]: ({ emptyContent }) => {
    if (emptyContent) {
      return (
        <EmptyMessage imageSize={36} className="gap-3">
          {emptyContent}
        </EmptyMessage>
      );
    }
    return (
      <EmptyMessage imageSize={36} className="gap-3">
        No data exists.
      </EmptyMessage>
    );
  },
  [MenuFeedbackStateTypes.NO_RESULTS]: ({ noResultsContent }) => {
    if (noResultsContent) {
      return (
        <EmptyMessage imageSize={36} className="gap-3">
          {noResultsContent}
        </EmptyMessage>
      );
    }
    return (
      <EmptyMessage imageSize={36} className="gap-3">
        No data exists for the search criteria.
      </EmptyMessage>
    );
  },
  [MenuFeedbackStateTypes.ERROR]: ({ errorMessage, errorTitle, errorContent }) => {
    if (errorContent) {
      if (typeof errorContent === "string") {
        return <ErrorView title={errorTitle ?? "Error"}>{errorContent}</ErrorView>;
      }
      return errorContent;
    }
    return (
      <ErrorView title={errorTitle ?? "Error"}>
        {errorMessage ?? "There was an error loading the table data."}
      </ErrorView>
    );
  },
};

const PrivateMenuFeedbackState = ({
  stateType,
  className,
  style,
  ...props
}: Omit<MenuFeedbackStateProps, "hasNoResults" | "isError" | "isEmpty" | "children"> & {
  readonly stateType: MenuFeedbackStateType;
}) => {
  const Component = MenuFeedbackStates[stateType];
  return (
    <div
      style={style}
      className={classNames(
        "h-full w-full flex flex-col items-center justify-center min-h-[100px]",
        className,
      )}
    >
      <Component {...props} />
    </div>
  );
};

export const MenuFeedbackState = ({
  hasNoResults,
  isEmpty,
  isError,
  children,
  ...props
}: MenuFeedbackStateProps) => {
  if (isError) {
    return <PrivateMenuFeedbackState stateType="error" {...props} />;
  } else if (hasNoResults) {
    return <PrivateMenuFeedbackState stateType="no-results" {...props} />;
  } else if (isEmpty) {
    return <PrivateMenuFeedbackState stateType="empty" {...props} />;
  }
  return <>{children}</>;
};
