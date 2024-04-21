import { ShowHide } from "~/components/util";

import { ErrorView, type ErrorViewProps } from "../../views/ErrorView";

export interface ErrorProps extends ErrorViewProps {
  readonly isError?: boolean;
  readonly hideChildrenOnError?: boolean;
}

export const Error = ({
  error,
  hideChildrenOnError = true,
  isError = false,
  children,
  ...props
}: ErrorProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={isError === true || (error !== undefined && error !== null)}>
          <ErrorView {...props} error={error} />
        </ShowHide>
        <ShowHide
          hide={
            (isError === true || (error !== undefined && error !== null)) && hideChildrenOnError
          }
        >
          {children}
        </ShowHide>
      </>
    );
  }
  return (
    <ShowHide show={isError === true || (error !== undefined && error !== null)}>
      <ErrorView {...props} error={error} />
    </ShowHide>
  );
};
