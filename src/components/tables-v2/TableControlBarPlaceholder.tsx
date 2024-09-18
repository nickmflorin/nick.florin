"use client";
import { type ReactNode, useEffect, useState } from "react";

import { Portal } from "@mui/base/Portal";

import { DeleteButton } from "~/components/buttons/DeleteButton";
import { Checkbox } from "~/components/input/Checkbox";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface TableControlBarPlaceholderProps extends ComponentProps {
  readonly children: ReactNode;
  readonly canDeleteRows?: boolean;
  readonly targetId?: string;
}

export const TableControlBarPlaceholder = ({
  children,
  canDeleteRows = false,
  targetId,
  ...props
}: TableControlBarPlaceholderProps): JSX.Element => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (targetId) {
      setContainer(document.getElementById(targetId));
    } else {
      setContainer(null);
    }
  }, [targetId]);

  return (
    <Portal container={container}>
      <div {...props} className={classNames("table-view__control-bar", props.className)}>
        <Checkbox readOnly value={false} isDisabled={true} />
        <div className="table-view__control-bar-actions">
          {canDeleteRows && <DeleteButton isDisabled={true} />}
          {children}
        </div>
      </div>
    </Portal>
  );
};
