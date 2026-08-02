import { isError } from '~/application/errors';
import * as terminal from '~/support/terminal';

type KeyValueLineItem = {
  label: string;
  value: string;
};

type IndexedNestedLineItem = {
  index: true;
  items: LineItem[];
  label?: never;
  value?: never;
};

type NestedKeyValueLineItem = {
  index?: true;
  items: LineItem[];
  label: string;
  value?: string;
};

type LineItem =
  IndexedNestedLineItem | KeyValueLineItem | LineItem[] | NestedKeyValueLineItem | null | string;

const lineItemIsNested = (
  lineItem: LineItem,
): lineItem is IndexedNestedLineItem | NestedKeyValueLineItem =>
  typeof lineItem !== 'string' &&
  lineItem !== null &&
  Array.isArray((lineItem as NestedKeyValueLineItem).items);

type MessageOptions = {
  readonly count?: [number, number];
  readonly indexLineItems?: boolean;
  readonly lineItems?: LineItem[];
};

type Level = 'begin' | 'complete' | 'error' | 'info' | 'success' | 'warn';

const LevelColors: Record<Level, (v: string) => string> = {
  begin: v => terminal.applyStyles(v, { foreground: 'yellow' }),
  complete: v => terminal.applyStyles(v, { foreground: 'green' }),
  error: v => terminal.applyStyles(v, { foreground: 'red' }),
  info: v => terminal.applyStyles(v, { foreground: 'gray' }),
  success: v => terminal.applyStyles(v, { foreground: 'green' }),
  warn: v => terminal.applyStyles(v, { foreground: 'yellow' }),
};

const IndentedLevelColors: Record<Level, (v: string) => string> = {
  begin: v => terminal.applyStyles(v, { foreground: 'yellow' }),
  complete: v => terminal.applyStyles(v, { foreground: 'cyan' }),
  error: v => terminal.applyStyles(v, { foreground: 'red' }),
  info: v => terminal.applyStyles(v, { foreground: 'gray' }),
  success: v => terminal.applyStyles(v, { foreground: 'green' }),
  warn: v => terminal.applyStyles(v, { foreground: 'yellow' }),
};

export class SeedStdout {
  private readonly isNested: boolean = false;
  private nestedLevel = 0;

  constructor({ isNested, nestedLevel = 0 }: { isNested: boolean; nestedLevel?: number }) {
    this.nestedLevel = nestedLevel;
    this.isNested = isNested;
  }

  private colorize(msg: string, level: Level): string {
    if (this.isNested) {
      return IndentedLevelColors[level](msg);
    }
    return LevelColors[level](msg);
  }

  private formatLineItem(
    item: LineItem,
    index: number,
    {
      additionalIndent = 0,
      indexLineItems = true,
    }: { readonly additionalIndent?: number } & Pick<MessageOptions, 'indexLineItems'>,
  ): null | string {
    let msg: string;
    if (item === null) {
      return null;
    } else if (lineItemIsNested(item)) {
      const formatted = this.formatLineItems(item.items, {
        additionalIndent: additionalIndent + 1,
        indexLineItems: indexLineItems || item.index === true,
      });
      if (!formatted) {
        return null;
      } else if (item.value) {
        msg = `${item.label}: ${item.value}\n${formatted}`;
      } else if (item.label) {
        msg = `${item.label}:\n${formatted}`;
      } else {
        msg = `\n${formatted}`;
      }
    } else if (Array.isArray(item)) {
      return this.formatLineItems(item, {
        additionalIndent: additionalIndent + 1,
        indexLineItems,
      });
    } else {
      msg = typeof item === 'string' ? item : `${item.label}: ${item.value}`;
    }
    return indexLineItems
      ? this.colorize(
          this.indent(`${index + 1}. ${msg}`, { additional: additionalIndent + 1 }),
          'info',
        )
      : this.colorize(this.indent(`- ${msg}`, { additional: additionalIndent + 1 }), 'info');
  }

  private formatLineItems(
    items: LineItem[],
    options: { readonly additionalIndent?: number } & Pick<MessageOptions, 'indexLineItems'>,
  ): null | string {
    const mapped = items
      .map((item, i) => this.formatLineItem(item, i, options))
      .filter(v => v !== null);
    if (mapped.length === 0) {
      return null;
    }
    return mapped.join('\n');
  }

  private formatMessage(message: string, level: Level, opts?: LineItem[] | MessageOptions): string {
    let lineItems: LineItem[] = [];
    let count: [number, number] | null = null;
    let indexLineItems = false;
    if (opts) {
      if (Array.isArray(opts)) {
        lineItems = opts.filter(ln => ln !== null);
      } else {
        lineItems = (opts.lineItems ?? []).filter(ln => ln !== null);
        count = opts.count ?? null;
        indexLineItems = opts.indexLineItems ?? false;
      }
    }
    let msg = message;
    if (count) {
      msg = `${msg} (${count[0] + 1}/${count[1]})`;
    }
    if (lineItems.length !== 0) {
      const formatted = this.formatLineItems(lineItems, { indexLineItems });
      if (formatted) {
        return `${this.colorize(this.indent(msg, {}), level)}\n${formatted}`;
      }
    }
    return this.colorize(this.indent(msg, {}), level);
  }

  private indent(msg: string, { additional = 0 }: { additional?: number }): string {
    return `${this.indentation}${'  '.repeat(additional)}${msg}`;
  }

  public begin(message: string, opts?: LineItem[] | MessageOptions): SeedStdout {
    const currentLevel = this.nestedLevel;
    if (this.isNested) {
      this.nestedLevel = currentLevel + 1;
    }
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, 'begin', opts));
    return new SeedStdout({ isNested: true, nestedLevel: currentLevel + 1 });
  }

  public complete(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, 'complete', opts));
    if (this.isNested) {
      this.nestedLevel = Math.max(this.nestedLevel - 1, 0);
    }
  }

  public error(message: Error | string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage(isError(message) ? message.message : message, 'error', opts));
  }

  public failed(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, 'error', opts));
    if (this.isNested) {
      this.nestedLevel = Math.max(this.nestedLevel - 1, 0);
    }
  }

  public info(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, 'info', opts));
  }

  public success(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage(message, 'success', opts));
  }

  public warn(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage(message, 'warn', opts));
  }

  private get indentation(): string {
    return ' '.repeat(this.nestedLevel);
  }
}

export const stdout = new SeedStdout({ isNested: false });
