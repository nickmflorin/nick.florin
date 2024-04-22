import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { ResumeModelTileBody } from "./ResumeModelTileBody";
import { ResumeModelTileHeader } from "./ResumeModelTileHeader";
import { ResumeModelTileSubTitle } from "./ResumeModelTileSubTitle";
import { ResumeModelTileTitle } from "./ResumeModelTileTitle";

export interface ResumeModelTileProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalResumeModelTile = ({ children, ...props }: ResumeModelTileProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col w-full gap-[10px] max-w-100%", props.className)}>
    {children}
  </div>
);

export const ResumeModelTile = Object.assign(LocalResumeModelTile, {
  Body: ResumeModelTileBody,
  Header: ResumeModelTileHeader,
  Title: ResumeModelTileTitle,
  SubTitle: ResumeModelTileSubTitle,
});

export default ResumeModelTile;
