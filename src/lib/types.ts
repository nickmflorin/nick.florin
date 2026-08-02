export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ExtractValues<T> = T[keyof T];
