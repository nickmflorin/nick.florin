import dynamic from "next/dynamic";
import React, { type ForwardedRef, forwardRef, useMemo } from "react";

import { isFragment } from "react-is";

import { getModelLabel } from "~/components/menus";

import { BaseSelectInput } from "./BaseSelectInput";
import * as types from "./types";

const MultiValueRenderer = dynamic(
  () => import("./MultiValueRenderer"),
) as types.MultiValueRendererCompoenent;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const SelectInput = forwardRef<HTMLDivElement, types.SelectInputProps<any, any, any>>(
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    {
      isReady = true,
      dynamicHeight = true,
      options,
      maximumValuesToRender,
      models,
      valueRenderer,
      valueModelRenderer,
      ...props
    }: types.SelectInputProps<V, M, O>,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    const renderedValue = useMemo(() => {
      if (models.length === 0) {
        return <></>;
      } else if (options.isMulti) {
        if (valueRenderer) {
          return valueRenderer();
        }
        return (
          <MultiValueRenderer
            models={models}
            dynamicHeight={dynamicHeight}
            options={options}
            maximumValuesToRender={maximumValuesToRender}
            valueModelRenderer={valueModelRenderer}
          />
        );
      } else {
        const model = models[0];
        if (valueModelRenderer) {
          return valueModelRenderer(model);
        }
        return types.isSelectValueModel(model)
          ? model.label
          : (types.getSelectModelValueLabel(model as M, options) ??
              getModelLabel(model as M, options));
      }
    }, [valueRenderer, valueModelRenderer, models, options, maximumValuesToRender, dynamicHeight]);

    return (
      <BaseSelectInput
        {...props}
        dynamicHeight={dynamicHeight}
        ref={ref}
        isLocked={props.isLocked || !isReady}
        showPlaceholder={
          renderedValue === null ||
          renderedValue === undefined ||
          typeof renderedValue === "boolean" ||
          (typeof renderedValue === "string" && renderedValue.length === 0) ||
          isFragment(renderedValue)
        }
      >
        <>{renderedValue}</>
      </BaseSelectInput>
    );
  },
) as {
  <
    V extends types.UnsafeSelectValueForm<M, O>,
    M extends types.SelectModel,
    O extends types.SelectOptions<M>,
  >(
    props: types.SelectInputProps<V, M, O> & { readonly ref?: ForwardedRef<HTMLDivElement> },
  ): JSX.Element;
};
