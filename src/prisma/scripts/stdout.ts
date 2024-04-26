import * as terminal from "~/application/support/terminal";

type KeyValueLineItem = {
  label: string;
  value: string;
};

type IndexedNextedLineItem = {
  items: LineItem[];
  index: true;
  label?: never;
  value?: never;
};

type NestedKeyValueLineItem = {
  label: string;
  value?: string;
  items: LineItem[];
  index?: true;
};

type LineItem =
  | KeyValueLineItem
  | string
  | NestedKeyValueLineItem
  | null
  | LineItem[]
  | IndexedNextedLineItem;

const lineItemIsNested = (
  lineItem: LineItem,
): lineItem is NestedKeyValueLineItem | IndexedNextedLineItem =>
  typeof lineItem !== "string" &&
  lineItem !== null &&
  Array.isArray((lineItem as NestedKeyValueLineItem).items);

type MessageOptions = {
  readonly lineItems?: LineItem[];
  readonly count?: [number, number];
  readonly indexLineItems?: boolean;
};

type Level = "info" | "error" | "complete" | "begin" | "warn";

const LevelColors: { [key in Level]: string } = {
  info: terminal.GRAY,
  error: terminal.RED,
  complete: terminal.GREEN,
  begin: terminal.YELLOW,
  warn: terminal.YELLOW,
};

const IndentedLevelColors: { [key in Level]: string } = {
  info: terminal.GRAY,
  error: terminal.RED,
  complete: terminal.CYAN,
  begin: terminal.YELLOW,
  warn: terminal.YELLOW,
};

export class SeedStdout {
  private nestedLevel: number = 0;
  private readonly isNested: boolean = false;

  constructor({ nestedLevel = 0, isNested }: { nestedLevel?: number; isNested: boolean }) {
    this.nestedLevel = nestedLevel;
    this.isNested = isNested;
  }

  private get indentation(): string {
    return " ".repeat(this.nestedLevel);
  }

  private indent(msg: string, { additional = 0 }: { additional?: number }): string {
    return `${this.indentation}${"  ".repeat(additional)}${msg}`;
  }

  private colorize(msg: string, level: Level): string {
    if (this.isNested) {
      return IndentedLevelColors[level] + msg + terminal.RESET;
    }
    return LevelColors[level] + msg + terminal.RESET;
  }

  private formatLineItem(
    item: LineItem,
    index: number,
    {
      indexLineItems = true,
      additionalIndent = 0,
    }: Pick<MessageOptions, "indexLineItems"> & { readonly additionalIndent?: number },
  ): string | null {
    let msg: string;
    if (item === null) {
      return null;
    } else if (lineItemIsNested(item)) {
      const formatted = this.formatLineItems(item.items, {
        indexLineItems: indexLineItems || item.index === true,
        additionalIndent: additionalIndent + 1,
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
        indexLineItems,
        additionalIndent: additionalIndent + 1,
      });
    } else {
      msg = typeof item === "string" ? item : `${item.label}: ${item.value}`;
    }
    return indexLineItems
      ? this.colorize(
          this.indent(`${index + 1}. ${msg}`, { additional: additionalIndent + 1 }),
          "info",
        )
      : this.colorize(this.indent(`- ${msg}`, { additional: additionalIndent + 1 }), "info");
  }

  private formatLineItems(
    items: LineItem[],
    options: Pick<MessageOptions, "indexLineItems"> & { readonly additionalIndent?: number },
  ): string | null {
    const mapped = items
      .map((item, i) => this.formatLineItem(item, i, options))
      .filter(v => v !== null);
    if (mapped.length === 0) {
      return null;
    }
    return mapped.join("\n");
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
    if (lineItems && lineItems.length !== 0) {
      const formatted = this.formatLineItems(lineItems, { indexLineItems });
      if (formatted) {
        return `${this.colorize(this.indent(msg, {}), level)}\n${formatted}`;
      }
    }
    return this.colorize(this.indent(msg, {}), level);
  }

  public complete(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, "complete", opts));
    if (this.isNested) {
      this.nestedLevel = Math.max(this.nestedLevel - 1, 0);
    }
  }

  public failed(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, "error", opts));
    if (this.isNested) {
      this.nestedLevel = Math.max(this.nestedLevel - 1, 0);
    }
  }

  public info(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, "info", opts));
  }

  public error(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage(message, "error", opts));
  }

  public warn(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.error(this.formatMessage(message, "warn", opts));
  }

  public begin(message: string, opts?: LineItem[] | MessageOptions): SeedStdout {
    const currentLevel = this.nestedLevel;
    if (this.isNested) {
      this.nestedLevel = currentLevel + 1;
    }
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, "begin", opts));
    return new SeedStdout({ nestedLevel: currentLevel + 1, isNested: true });
  }
}

export const stdout = new SeedStdout({ isNested: false });
