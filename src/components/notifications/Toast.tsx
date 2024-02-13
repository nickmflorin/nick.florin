"use client";
import { useEffect } from "react";

import { toast, type ToastContent, type ToastOptions } from "react-toastify";

import { capitalize } from "~/lib/formatters";

export interface ToastProps<T> extends ToastOptions<T> {
  readonly children: ToastContent<T>;
}

const LocalToast = <T,>({ children, ...options }: ToastProps<T>): JSX.Element => {
  useEffect(() => {
    toast(children, options);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- Only run once. */
  }, []);

  return <></>;
};

const ToastVariantNames = ["info", "success", "error", "warning"] as const;

type ToastVariant = {
  <T>(props: Omit<ToastProps<T>, "type">): JSX.Element;
};

type ToastVariants = { [key in Capitalize<(typeof ToastVariantNames)[number]>]: ToastVariant };

// Note: This does not seem to be working with server components/layouts!
const withVariants = [...ToastVariantNames].reduce<ToastVariants>(
  (prev, variant) => ({
    ...prev,
    [capitalize(variant)]: <T,>(props: Omit<ToastProps<T>, "type">) => (
      <LocalToast {...props} type={variant} />
    ),
  }),
  {} as ToastVariants,
);

export const Toast = Object.assign(LocalToast, withVariants);
