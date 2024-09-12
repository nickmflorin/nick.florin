export const RESET = "\x1b[0m";

type TerminalStyleAsciiCode<C extends string | number> = `\x1b[${C}m`;

const terminalCodeToAscii = <C extends string | number>(code: C): TerminalStyleAsciiCode<C> =>
  `\x1b[${code}m`;

export type TerminalStyleType = "foreground" | "background" | "effect";

const TerminalStyleCodes = {
  foreground: {
    black: 30,
    red: 31,
    brightred: 91,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    gray: 90,
  },
  background: {
    black: 40,
    red: 41,
    green: 42,
    yellow: 43,
    blue: 44,
    magenta: 45,
    cyan: 46,
    white: 47,
  },
  effect: {
    bright: 1,
    dim: 2,
  },
} as const satisfies { [key in TerminalStyleType]: { [key in string]: number } };

export type TerminalEffect = keyof (typeof TerminalStyleCodes)["effect"];
export type TerminalBgColor = keyof (typeof TerminalStyleCodes)["background"];
export type TerminalColor = keyof (typeof TerminalStyleCodes)["foreground"];

export type TerminalStyleName<T extends TerminalStyleType> = keyof (typeof TerminalStyleCodes)[T];

export type TerminalStyleCode<
  T extends TerminalStyleType,
  N extends TerminalStyleName<T>,
> = (typeof TerminalStyleCodes)[T][N] & number;

const getTerminalStyleCode = <T extends TerminalStyleType, N extends TerminalStyleName<T>>(
  styleType: T,
  name: N,
): TerminalStyleCode<T, N> & number => {
  const code = TerminalStyleCodes[styleType][name];
  if (typeof code !== "number") {
    throw new TypeError(
      `Unexpectedly encountered non-numeric code for ${styleType}-${String(name)}.`,
    );
  }
  return code as TerminalStyleCode<T, N> & number;
};

const getTerminalStyleAsciiCode = <T extends TerminalStyleType, N extends TerminalStyleName<T>>(
  styleType: T,
  name: N,
): TerminalStyleAsciiCode<TerminalStyleCode<T, N>> => {
  const code = getTerminalStyleCode(styleType, name);
  return terminalCodeToAscii(code);
};

export type TerminalStyle =
  | TerminalColor
  | Partial<{ [key in TerminalStyleType]: TerminalStyleName<key> }>;

export const applyStyles = (value: string | number, config: TerminalStyle): string => {
  if (typeof config === "string") {
    return getTerminalStyleAsciiCode("foreground", config) + value + RESET;
  }
  let v = String(value);
  for (const key in config) {
    const name = config[key as TerminalStyleType] as TerminalStyleName<TerminalStyleType>;
    v = getTerminalStyleAsciiCode(key as TerminalStyleType, name) + v;
  }
  return v + RESET;
};
