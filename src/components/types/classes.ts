/* eslint-disable-next-line no-restricted-imports */
import clsx, { type ClassArray, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ClassName = ClassArray | ClassValue;

export const classNames = (...classes: ClassName[]): string => twMerge(classes.map(c => clsx(c)));
