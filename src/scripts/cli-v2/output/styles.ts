import { styleText } from 'node:util';

/**
 * The semantic roles the CLI colors text by. Call sites name the meaning rather than the color, so
 * that the palette is decided in one place and a change to it cannot be applied inconsistently.
 */
export type StyleRole =
  'added' | 'changed' | 'emphasis' | 'heading' | 'muted' | 'removed' | 'reordered' | 'warning';

type StyleFormat = Parameters<typeof styleText>[0];

const RoleFormats = {
  added: 'green',
  changed: 'yellow',
  emphasis: 'bold',
  heading: ['bold', 'cyan'],
  muted: 'gray',
  removed: 'red',
  reordered: 'yellow',
  warning: 'yellow',
} as const satisfies Record<StyleRole, StyleFormat>;

/**
 * Styles a value for one of the CLI's {@link StyleRole semantic roles}.
 *
 * Node's `styleText` suppresses the escape codes itself when the stream is not a TTY or `NO_COLOR`
 * is set, so piping the CLI's output to a file yields plain text without the call site having to
 * ask whether color is wanted.
 */
export const styled = (role: StyleRole, value: number | string): string =>
  styleText(RoleFormats[role], String(value));
