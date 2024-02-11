import React from "react";

import clsx from "clsx";

import { Icon } from "./Icon";
import { type SpinnerProps } from "./types";

export const Spinner = ({ isLoading, ...props }: SpinnerProps): JSX.Element =>
  isLoading === true ? (
    <Icon
      {...props}
      className={clsx("spinner", props.className)}
      spin={true}
      icon={{ name: "circle-notch" }}
      fit="square"
    />
  ) : (
    <></>
  );

export default Spinner;
