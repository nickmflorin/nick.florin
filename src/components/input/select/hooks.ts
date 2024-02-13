import { useRef } from "react";

import type * as types from "./types";

import { type MenuModel, type MenuOptions, type MenuValue } from "~/components/menus";

export const useSelect = <M extends MenuModel, O extends MenuOptions<M>>() =>
  useRef<types.SelectInstance<M, O>>({
    // This may be bug prone - we should revisit later.
    value: undefined as unknown as MenuValue<M, O>,
    setLoading: () => {},
    setValue: () => {},
    setOpen: () => {},
  });
