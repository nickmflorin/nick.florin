export type HexColor = `#${string}`;

type RGBColorOptions = {
  readonly alpha?: number;
  readonly format?: 'set' | 'string';
  readonly strict?: boolean;
};

type RGBColorSet<O extends RGBColorOptions> = O extends { alpha: infer A extends number }
  ? {
      a: A;
      b: number;
      g: number;
      r: number;
    }
  : {
      a?: never;
      b: number;
      g: number;
      r: number;
    };

type RGBReturn<O extends RGBColorOptions> = O extends { format: 'set' }
  ? O extends { strict: false }
    ? null | RGBColorSet<O>
    : RGBColorSet<O>
  : O extends { strict: false }
    ? null | string
    : string;

export const hexToRgb = <O extends RGBColorOptions>(hex: HexColor, opts: O): RGBReturn<O> => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    if (opts.format === 'set') {
      if (opts.alpha) {
        return {
          a: opts.alpha,
          b,
          g,
          r,
        } as RGBReturn<O>;
      }
      return {
        b,
        g,
        r,
      } as RGBReturn<O>;
    }
    return `rgb${opts.alpha ? 'a' : ''}(${r}, ${g}, ${b}${
      opts.alpha ? `, ${opts.alpha}` : ''
    })` as RGBReturn<O>;
  } else if (opts.strict === false) {
    return null as RGBReturn<O>;
  }
  throw new Error(`Invalid hex color '${hex}' provided!`);
};
