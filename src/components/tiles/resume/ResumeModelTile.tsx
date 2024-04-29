import { type ReactNode } from "react";

import clsx from "clsx";

import { sizeToString, type ComponentProps, type Size } from "~/components/types";

import { Details } from "./Details";
import { ResumeModelBadges } from "./ResumeModelBadges";
import { ResumeModelDescription } from "./ResumeModelDescription";
import { ResumeModelHeader } from "./ResumeModelHeader";
import { ResumeModelImage } from "./ResumeModelImage";
import { ResumeModelSection } from "./ResumeModelSection";
import { ResumeModelSubTitle } from "./ResumeModelSubTitle";
import { ResumeModelTitle } from "./ResumeModelTitle";

export interface ResumeModelProps extends ComponentProps {
  readonly children: ReactNode;
  readonly gap?: Size;
}

const LocalResumeModelTile = ({ children, gap = 10, ...props }: ResumeModelProps): JSX.Element => (
  <div
    {...props}
    className={clsx("flex flex-col w-full max-w-100%", props.className)}
    style={{ gap: sizeToString(gap, "px") }}
  >
    {children}
  </div>
);

export const ResumeModelTile = Object.assign(LocalResumeModelTile, {
  Title: ResumeModelTitle,
  SubTitle: ResumeModelSubTitle,
  Image: ResumeModelImage,
  Badges: ResumeModelBadges,
  Details,
  Section: ResumeModelSection,
  Description: ResumeModelDescription,
  Header: ResumeModelHeader,
});

export default ResumeModelTile;
