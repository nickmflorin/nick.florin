import React from "react";

import clsx from "clsx";

import { CircleNotch } from "./CircleNotch";
import { type SpinnerProps } from "./types";
import { getBaseIconClassName, getNativeIconStyle } from "./util";

export const Spinner = ({ isLoading, ...props }: SpinnerProps): JSX.Element =>
  isLoading === true ? (
    <i
      style={{ ...props.style, ...getNativeIconStyle(props) }}
      className={clsx("spinner", getBaseIconClassName({ ...props, fit: "square" }))}
    >
      <CircleNotch />
    </i>
  ) : (
    <></>
  );

export default Spinner;
