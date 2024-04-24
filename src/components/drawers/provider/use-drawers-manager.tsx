"use client";
import dynamic from "next/dynamic";
import React, { useState, useCallback, useMemo } from "react";

import clsx from "clsx";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { DrawerHistoryButtons } from "~/components/buttons/DrawerHistoryButtons";
import { Loading } from "~/components/feedback/Loading";
import { ShowHide } from "~/components/util";

import { DrawerContainer } from "../DrawerContainer";

import { getDrawerComponent } from "./drawers";

type DrawerHistory = {
  drawers: JSX.Element[];
  index: number;
};

const canGoBack = (history: DrawerHistory | null) =>
  history !== null && history.drawers.length > 1 && history.index > 0;

const canGoForward = (history: DrawerHistory | null) =>
  history !== null && history.drawers.length > 1 && history.index < history.drawers.length - 1;

const DrawerRenderer = <D extends types.DrawerId>({
  id,
  backEnabled,
  forwardEnabled,
  props,
  onBack,
  onClose,
}: {
  backEnabled: boolean;
  forwardEnabled: boolean;
  id: D;
  props: DrawerDynamicProps<D>;
  onBack: () => void;
  onClose: () => void;
}) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
  const ps = {
    ...props,
    onClose,
  } as React.ComponentProps<typeof Drawer>;

  return (
    <DrawerContainer
      className={clsx({
        "pt-[48px]": backEnabled || forwardEnabled,
      })}
    >
      <Drawer {...ps} />
      <div
        className={clsx(
          "flex flex-row items-center justify-between",
          "absolute z-100 top-[16px] right-[12px]",
        )}
      >
        <ShowHide show={backEnabled || forwardEnabled}>
          <DrawerHistoryButtons
            backEnabled={backEnabled}
            forwardEnabled={forwardEnabled}
            onBack={() => onBack()}
          />
        </ShowHide>
        <DrawerCloseButton key="1" onClick={() => onClose()} />
      </div>
    </DrawerContainer>
  );
};

export const useDrawersManager = (): Omit<DrawersManager, "isReady"> => {
  // const [drawer, setDrawer] = useState<JSX.Element | null>(null);

  const [drawerHistory, setDrawerHistory] = useState<DrawerHistory | null>(null);

  const close = useCallback(() => {
    setDrawerHistory(null);
  }, []);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: DrawerDynamicProps<D>, handler?: () => void) =>
      setDrawerHistory(curr => {
        const newDrawers = [
          ...(curr?.drawers ?? []),
          <DrawerRenderer
            key={curr?.drawers.length ?? "0"}
            id={id}
            props={props}
            forwardEnabled={curr !== null && curr.drawers.length >= 1}
            backEnabled={curr !== null && curr.drawers.length >= 1}
            onBack={() => {
              // Temporary - just for checking
              setDrawerHistory(null);
            }}
            onClose={() => {
              handler?.();
              setDrawerHistory({ drawers: [], index: 0 });
            }}
          />,
        ];
        /* Note: Since opening a drawer always means showing the new drawer being opened, we always
           increment the index to the end of the 'drawers' array in history. */
        return { drawers: newDrawers, index: newDrawers.length - 1 };
      }),
    [],
  );

  const drawer = useMemo(() => {
    if (drawerHistory !== null && drawerHistory.drawers.length > 0) {
      const drawer = drawerHistory.drawers[drawerHistory.index];
      if (drawer === undefined) {
        console.warn("");
        return null;
      }
      return drawer;
    }
    return null;
  }, [drawerHistory]);

  return { drawer, open, close };
};
