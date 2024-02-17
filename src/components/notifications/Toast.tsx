"use client";
import { useEffect } from "react";

import { toast, type ToastContent, type ToastOptions } from "react-toastify";

export interface ToastProps<T> extends ToastOptions<T> {
  readonly children: ToastContent<T>;
}

export const Toast = <T,>({ children, ...options }: ToastProps<T>): JSX.Element => {
  useEffect(() => {
    toast(children, options);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- Only run once. */
  }, []);

  return <></>;
};

export default Toast;
