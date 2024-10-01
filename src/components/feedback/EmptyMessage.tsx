import Image from "next/image";
import type { ReactNode } from "react";

import {
  classNames,
  inferQuantitativeSizeValue,
  type ComponentProps,
  type QuantitativeSize,
} from "~/components/types";
import { Description } from "~/components/typography";

export interface EmptyMessageProps extends ComponentProps {
  readonly imageSize?: QuantitativeSize<"px">;
  readonly children?: ReactNode;
}

export const EmptyMessage = ({
  imageSize = 72,
  children,
  ...props
}: EmptyMessageProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "flex flex-col items-center justify-center gap-6 max-w-[280px] p-2",
      props.className,
    )}
  >
    <Image
      src="/empty.svg"
      width={inferQuantitativeSizeValue(imageSize)}
      height={inferQuantitativeSizeValue(imageSize)}
      alt="Empty"
    />
    <Description fontSize="sm" fontWeight="regular" align="center">
      {children}
    </Description>
  </div>
);
