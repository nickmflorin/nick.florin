import { logger } from "~/internal/logger";

type RefConnectedCalback<T, R = unknown> = (obj: T) => R;

type InferRefCallbackReturn<T, C extends RefConnectedCalback<T>> =
  C extends RefConnectedCalback<T, infer R> ? R : never;

type IsRefConnectedOpts<D = unknown> = IsRefConnectedLaxOpts<D> | IsRefConnectedStrictOpts;

type IsRefConnectedLaxOpts<D = unknown> = {
  readonly strict?: false;
  readonly name?: string;
  readonly message?: string;
  readonly methodName?: string;
  readonly defaultValue?: D;
};

type IsRefConnectedStrictOpts = {
  readonly strict: true;
  readonly name?: string;
  readonly message?: string;
  readonly methodName?: string;
  readonly defaultValue?: never;
};

type RefAttributeDefaultValue<O extends IsRefConnectedOpts> = O extends { defaultValue: infer D }
  ? D
  : void;

type IfRefConnectedRT<
  T,
  C extends RefConnectedCalback<T>,
  O extends IsRefConnectedOpts,
> = O extends {
  strict: true;
}
  ? InferRefCallbackReturn<T, C>
  : InferRefCallbackReturn<T, C> | RefAttributeDefaultValue<O>;

export const ifRefConnected = <T, C extends RefConnectedCalback<T>, O extends IsRefConnectedOpts>(
  ref: React.RefObject<T | null>,
  cb: C,
  opts?: O,
): IfRefConnectedRT<T, C, O> => {
  const errorMessage =
    opts?.message ??
    (opts?.name !== undefined
      ? opts?.methodName
        ? `The method '${opts.methodName}' cannot be executed on the ref instance because ` +
          `the ref '${opts.name}' is not yet connected to the UI.`
        : `The method cannot be executed on the ref instance because the ref '${opts.name}' is ` +
          "not yet connected to the UI."
      : opts?.methodName
        ? `The method '${opts.methodName}' cannot be executed on the ref instance because the ` +
          "ref is not yet connected to the UI."
        : "The method cannot be executed on the ref instance because the ref is not yet " +
          "connected to the UI.");
  if (ref.current) {
    return cb(ref.current) as InferRefCallbackReturn<T, C> as IfRefConnectedRT<T, C, O>;
  } else if (opts?.strict) {
    throw new Error(errorMessage);
  }
  logger.warn(errorMessage);
  return opts?.defaultValue as RefAttributeDefaultValue<O> as IfRefConnectedRT<T, C, O>;
};
