import React from "react";

import clsx from "clsx";

import { IconComponent } from "./IconComponent";
import { type SpinnerProps } from "./types";

export const Spinner = ({ loading, ...props }: SpinnerProps): JSX.Element =>
  loading === true ? (
    <IconComponent
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
