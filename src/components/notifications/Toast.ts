'use client';
import { type JSX, useEffect, useEffectEvent } from 'react';

import { toast, type ToastContent, type ToastOptions } from 'react-toastify';

export interface ToastProps<T> extends ToastOptions<T> {
  readonly children: ToastContent<T>;
}

/**
 * Dispatches the toast exactly once, when the calling component mounts.
 *
 * The content and options are read through an effect event, which keeps that logic non-reactive -
 * `options` is a rest object that is rebuilt on every render, so depending on it would dispatch a
 * new toast on every render.
 */
const useDispatchToastOnMount = <T>(children: ToastContent<T>, options: ToastOptions<T>) => {
  const showToast = useEffectEvent(() => toast(children, options));

  useEffect(() => {
    showToast();
  }, []);
};

export const Toast = <T>({ children, ...options }: ToastProps<T>): JSX.Element | null => {
  useDispatchToastOnMount(children, options);

  return null;
};
