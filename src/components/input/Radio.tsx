"use client";

import { useRef, forwardRef } from "react";

import { Radio as RootRadio, type RadioProps as RootRadioProps } from "@mantine/core";

import { classNames } from "~/components/types";
import { Label } from "~/components/typography";

import { type ComponentProps } from "../types";

export interface RadioProps
  extends ComponentProps,
    Omit<RootRadioProps, "className" | "style" | "children" | "onChange" | "onClick"> {
  readonly children?: string;
  readonly onClick?: (checked: boolean) => void;
}

export const Radio = forwardRef<HTMLDivElement, RadioProps>(
  ({ children, className, style, onClick, ...props }: RadioProps, rootRef) => {
    const ref = useRef<HTMLDivElement | null>(null);

    if (children) {
      return (
        <div
          style={style}
          className={classNames("flex flex-row gap-[4px] h-[20px]", className)}
          onClick={() => {
            if (ref.current) {
              /* eslint-disable-next-line quotes */
              const d = ref.current.querySelector('input[type="radio"]');
              if (d && d instanceof HTMLInputElement) {
                onClick?.(d.checked);
              }
            }
          }}
        >
          <Radio
            readOnly
            ref={instance => {
              ref.current = instance;
              if (typeof rootRef === "function") {
                rootRef(instance);
              } else if (rootRef) {
                rootRef.current = instance;
              }
            }}
            {...props}
          />
          <Label fontSize="sm" fontWeight="medium" className="leading-[20px]">
            {children}
          </Label>
        </div>
      );
    }
    return <RootRadio {...props} rootRef={rootRef} className="radio" />;
  },
);
