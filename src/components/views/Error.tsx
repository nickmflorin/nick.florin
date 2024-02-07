import React from "react";

import { Text } from "~/components/typography/Text";
import { View, type ViewProps } from "~/components/views/View";

export interface ErrorProps extends ViewProps {
  readonly error?: JSX.Element | string | null;
  readonly hideWhenError?: boolean;
}

const _WrappedError = ({
  error,
  ...props
}: Omit<ErrorProps, "children" | "hideWhenError" | "error"> & {
  readonly error: JSX.Element | string;
}) => (
  <View {...props}>
    {typeof error === "string" ? <Text className="text-danger-500">{error}</Text> : error}
  </View>
);

const WrappedError = React.memo(_WrappedError);

export const _Error = ({
  error,
  overlay = true,
  hideWhenError = true,
  children,
  ...props
}: ErrorProps): JSX.Element => {
  if (children) {
    if (hideWhenError === true) {
      return error ? <WrappedError {...props} error={error} /> : <>{children}</>;
    }
    return (
      <>
        {error !== null && error !== undefined && (
          <WrappedError {...props} error={error} overlay={overlay} />
        )}
        {children}
      </>
    );
  } else if (error !== undefined && error !== null) {
    return <WrappedError {...props} error={error} overlay={overlay} />;
  }
  return <></>;
};

export const Error = React.memo(_Error);
