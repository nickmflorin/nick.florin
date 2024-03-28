import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface SeriesProps extends ComponentProps {
  readonly children: JSX.Element | JSX.Element[];
}

export const Series = ({ children, ...props }: SeriesProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
    {children}
  </div>
);
