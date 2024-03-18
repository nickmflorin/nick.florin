import { useRef, type MutableRefObject, type ForwardedRef, useImperativeHandle } from "react";

import type * as types from "../types";

export function useTable<T extends types.TableModel>(
  propRef?: ForwardedRef<types.TableInstance<T>> | undefined,
): MutableRefObject<types.TableInstance<T>> {
  const newRef = useRef<types.TableInstance<T>>({
    setRowLoading: () => {},
    rowIsLoading: () => false,
  });
  useImperativeHandle(propRef, () => newRef.current);

  return newRef;
}
