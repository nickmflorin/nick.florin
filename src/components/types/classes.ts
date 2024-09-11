import clsx, { type ClassArray, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type ClassName = ClassValue | ClassArray;

export const classNames = (...classNames: ClassName[]): string =>
  twMerge(classNames.map(c => clsx(c)));
