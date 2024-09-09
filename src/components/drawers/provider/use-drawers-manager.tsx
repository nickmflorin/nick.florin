"use client";
import dynamic from "next/dynamic";
import React, { useState, useCallback, useMemo, cloneElement } from "react";

import type * as types from "./types";

import { logger } from "~/application/logger";

import { publish } from "~/events/drawer-state-change-event";

import { Loading } from "~/components/feedback/Loading";
import { useReferentialCallback } from "~/hooks";

import { type DrawerDynamicProps } from "./drawers";

const DrawerRenderer = dynamic(() => import("./DrawerRenderer"), {
  loading: () => <Loading isLoading={true} />,
});

type DrawerHistory = {
  rendered: {
    drawer: JSX.Element;
    id: DrawerId;
  }[];
  index: number;
};

export const useDrawersManager = (): Omit<types.DrawersManager, "isReady"> => {
  const [drawerHistory, setDrawerHistory] = useState<DrawerHistory | null>(null);

  const forwardEnabled = useMemo(
    () =>
      drawerHistory !== null &&
      drawerHistory.rendered.length > 1 &&
      drawerHistory.index < drawerHistory.rendered.length,
    [drawerHistory],
  );

  const backEnabled = useMemo(
    () => drawerHistory !== null && drawerHistory.rendered.length > 1 && drawerHistory.index > 1,
    [drawerHistory],
  );

  const close = useCallback(() => {
    setDrawerHistory(null);
    setTimeout(() => {
      publish({ state: "closed" });
    });
  }, []);

  const back = useReferentialCallback(() => {
    if (!drawerHistory) {
      /* This should not occur because if this were the case, the back button should either be
         disabled or not present. */
      logger.warn(
        "Suspicous State w Managed Drawers: The back event was triggered when there is no " +
          "drawer history! There must be drawer history in order to go back, and this " +
          "indicates there is an inconsistency in state or in the logic itself.",
      );
      return;
    } else if (drawerHistory.index < 2) {
      /* This should not occur because if this were the case, the back button should either be
         disabled or not present. */
      logger.warn(
        "Suspicous State w Managed Drawers: The back event was triggered when the active index " +
          `'${drawerHistory.index}', is less than 2!  There must be at least one drawer before the ` +
          "active index in order to go back, and this indicates there is an inconsistency in " +
          "state or the logic itself.",
        { index: drawerHistory.index, historyCount: drawerHistory.rendered.length },
      );
      return;
    }
    setDrawerHistory({ ...drawerHistory, index: Math.max(drawerHistory.index - 1, 1) });
  });

  const forward = useCallback(() => {
    setDrawerHistory(history => {
      if (!history) {
        /* This should not occur because if this were the case, the forward  button should either be
           disabled or not present. */
        logger.warn(
          "Suspicous State w Managed Drawers: The forward event was triggered when there is no " +
            "drawer history! There must be drawer history in order to go forward, and this " +
            "indicates there is an inconsistency in state or in the logic itself.",
        );
        return history;
      } else if (history.index === history.rendered.length) {
        /* This should not occur because if this were the case, the back button should either be
           disabled or not present. */
        logger.warn(
          "Suspicous State w Managed Drawers: The forward event was triggered when the active " +
            `index, '${history.index}', is the last index of the history array!  There must be ` +
            "at least one drawer after the active index in order to go forward, and this " +
            "indicates there is an inconsistency in state or the logic itself.",
          { index: history.index, historyCount: history.rendered.length },
        );
        return history;
      }
      return { ...history, index: Math.min(history.index + 1, history.rendered.length) };
    });
  }, []);

  const open = useCallback(
    <D extends DrawerId>(id: D, props: DrawerDynamicProps<D>, options?: types.OpenDrawerParams) => {
      const rendered = drawerHistory?.rendered || [];
      const newDrawer = <DrawerRenderer id={id} props={props} onClose={() => close()} />;
      if (options?.push) {
        setDrawerHistory({
          index: rendered.length + 1,
          rendered: [...rendered, { drawer: newDrawer, id }],
        });
        return setTimeout(() => publish({ state: "opened", id, props }));
      }
      setDrawerHistory({
        index: 1,
        rendered: [{ drawer: newDrawer, id }],
      });
      setTimeout(() => {
        for (let i = 0; i < rendered.length; i++) {
          publish({ state: "closed", id: rendered[i].id });
        }
        publish({ state: "opened", id, props });
      });
    },
    [close, drawerHistory],
  );

  const drawer = useMemo(() => {
    if (drawerHistory !== null && drawerHistory.rendered.length > 0) {
      const drawer = drawerHistory.rendered[drawerHistory.index - 1];
      if (drawer === undefined) {
        logger.warn(
          `Suspicous State w Managed Drawers: No drawer exists at index '${drawerHistory.index - 1}'!`,
          { historyCount: drawerHistory.rendered.length, index: drawerHistory.index },
        );
        return null;
      }
      if (drawerHistory.index < drawerHistory.rendered.length) {
        return cloneElement(drawer.drawer, { ...drawer.drawer.props, forwardEnabled: true });
      }
      return cloneElement(drawer.drawer, { ...drawer.drawer.props, forwardEnabled: false });
    }
    return null;
  }, [drawerHistory]);

  return { drawer, forwardEnabled, backEnabled, forward, back, open, close };
};
