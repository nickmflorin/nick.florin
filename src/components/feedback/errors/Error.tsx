import { ShowHide } from "~/components/util";

import { ErrorView, type ErrorViewProps } from "../../views/ErrorView";

export interface ErrorProps extends ErrorViewProps {
  readonly isError?: boolean;
}

export const Error = ({ error, isError = false, children, ...props }: ErrorProps): JSX.Element => {
  if (children) {
    return (
      <>
        <ShowHide show={isError === true || (error !== undefined && error !== null)}>
          <ErrorView {...props} error={error} />
        </ShowHide>
        {children}
      </>
    );
  }
  return (
    <ShowHide show={isError === true || (error !== undefined && error !== null)}>
      <ErrorView {...props} error={error} />
    </ShowHide>
  );
};
