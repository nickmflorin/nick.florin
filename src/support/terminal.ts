export const RESET = '\x1b[0m';

type TerminalStyleAsciiCode<C extends number | string> = `\x1b[${C}m`;

const terminalCodeToAscii = <C extends number | string>(code: C): TerminalStyleAsciiCode<C> =>
  `\x1b[${code}m`;

export type TerminalStyleType = 'background' | 'effect' | 'foreground';

const TerminalStyleCodes = {
  background: {
    black: 40,
    blue: 44,
    cyan: 46,
    green: 42,
    magenta: 45,
    red: 41,
    white: 47,
    yellow: 43,
  },
  effect: {
    bright: 1,
    dim: 2,
  },
  foreground: {
    black: 30,
    blue: 34,
    brightred: 91,
    cyan: 36,
    gray: 90,
    green: 32,
    magenta: 35,
    red: 31,
    white: 37,
    yellow: 33,
  },
} as const satisfies Record<TerminalStyleType, Record<string, number>>;

export type TerminalEffect = keyof (typeof TerminalStyleCodes)['effect'];
export type TerminalBgColor = keyof (typeof TerminalStyleCodes)['background'];
export type TerminalColor = keyof (typeof TerminalStyleCodes)['foreground'];

export type TerminalStyleName<T extends TerminalStyleType> = keyof (typeof TerminalStyleCodes)[T];

export type TerminalStyleCode<
  T extends TerminalStyleType,
  N extends TerminalStyleName<T>,
> = (typeof TerminalStyleCodes)[T][N] & number;

const getTerminalStyleCode = <T extends TerminalStyleType, N extends TerminalStyleName<T>>(
  styleType: T,
  name: N,
): number & TerminalStyleCode<T, N> => {
  const code = TerminalStyleCodes[styleType][name];
  if (typeof code !== 'number') {
    throw new TypeError(
      `Unexpectedly encountered non-numeric code for ${styleType}-${String(name)}.`,
    );
  }
  return code;
};

const getTerminalStyleAsciiCode = <T extends TerminalStyleType, N extends TerminalStyleName<T>>(
  styleType: T,
  name: N,
): TerminalStyleAsciiCode<TerminalStyleCode<T, N>> => {
  const code = getTerminalStyleCode(styleType, name);
  return terminalCodeToAscii(code);
};

export type TerminalStyle =
  Partial<{ [key in TerminalStyleType]: TerminalStyleName<key> }> | TerminalColor;

export const applyStyles = (value: number | string, config: TerminalStyle): string => {
  if (typeof config === 'string') {
    return getTerminalStyleAsciiCode('foreground', config) + value + RESET;
  }
  let v = String(value);
  if (config.background !== undefined) {
    v = getTerminalStyleAsciiCode('background', config.background) + v;
  }
  if (config.effect !== undefined) {
    v = getTerminalStyleAsciiCode('effect', config.effect) + v;
  }
  if (config.foreground !== undefined) {
    v = getTerminalStyleAsciiCode('foreground', config.foreground) + v;
  }
  return v + RESET;
};
