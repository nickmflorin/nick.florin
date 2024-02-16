import React from "react";

import clsx from "clsx";

import Icon from "./Icon";
import { CircleNotch } from "./svgs/CircleNotch";
import { type SpinnerProps } from "./types";

export const Spinner = ({ isLoading, ...props }: SpinnerProps): JSX.Element =>
  isLoading === true ? (
    <Icon {...props} className={clsx("spinner", props.className)}>
      <CircleNotch />
    </Icon>
  ) : (
    <></>
  );

export default Spinner;
