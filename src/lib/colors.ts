export type HexColor = `#${string}`;

type RGBColorOptions = {
  readonly alpha?: number;
  readonly format?: "string" | "set";
  readonly strict?: boolean;
};

type RGBColorSet<O extends RGBColorOptions> = O extends { alpha: infer A extends number }
  ? {
      r: number;
      g: number;
      b: number;
      a: A;
    }
  : {
      r: number;
      g: number;
      b: number;
      a?: never;
    };

type RGBReturn<O extends RGBColorOptions> = O extends { format: "set" }
  ? O extends { strict: false }
    ? RGBColorSet<O> | null
    : RGBColorSet<O>
  : O extends { strict: false }
    ? string | null
    : string;

export const hexToRgb = <O extends RGBColorOptions>(hex: HexColor, opts: O): RGBReturn<O> => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    if (opts.format === "set") {
      if (opts.alpha) {
        return {
          r,
          g,
          b,
          a: opts.alpha,
        } as RGBReturn<O>;
      }
      return {
        r,
        g,
        b,
      } as RGBReturn<O>;
    }
    return `rgb${opts.alpha ? "a" : ""}(${r}, ${g}, ${b}${
      opts.alpha ? `, ${opts.alpha}` : ""
    })` as RGBReturn<O>;
  } else if (opts.strict === false) {
    return null as RGBReturn<O>;
  } else {
    throw new Error(`Invalid hex color '${hex}' provided!`);
  }
};
