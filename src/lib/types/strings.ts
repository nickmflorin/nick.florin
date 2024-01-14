export type HyphensToUnderscores<T extends string> = T extends `${infer V extends
  string}-${infer L extends string}`
  ? HyphensToUnderscores<`${V}_${L}`>
  : T;

export type SpacesToUnderscores<T extends string> = T extends `${infer V extends
  string} ${infer L extends string}`
  ? SpacesToUnderscores<`${V}_${L}`>
  : T;
