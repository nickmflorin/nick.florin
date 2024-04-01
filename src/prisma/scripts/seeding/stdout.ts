import * as terminal from "~/application/support/terminal";

type KeyValueLineItem = {
  label: string;
  value: string;
};

type LineItem = KeyValueLineItem | string;

type MessageOptions = {
  readonly lineItems?: LineItem[];
  readonly count?: [number, number];
  readonly indexLineItems?: boolean;
};

type Level = "info" | "error" | "complete" | "begin";

const LevelColors: { [key in Level]: string } = {
  info: terminal.GRAY,
  error: terminal.RED,
  complete: terminal.GREEN,
  begin: terminal.YELLOW,
};

const IndentedLevelColors: { [key in Level]: string } = {
  info: terminal.GRAY,
  error: terminal.RED,
  complete: terminal.CYAN,
  begin: terminal.YELLOW,
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
    return `${this.indentation}${" ".repeat(additional)}${msg}`;
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
    { indexLineItems = true }: Pick<MessageOptions, "indexLineItems">,
  ): string {
    const msg = typeof item === "string" ? item : `${item.label}: ${item.value}`;
    return indexLineItems
      ? this.colorize(this.indent(`- ${index + 1}. ${msg}`, { additional: 1 }), "info")
      : this.colorize(this.indent(`- ${msg}`, { additional: 1 }), "info");
  }

  private formatLineItems(
    items: LineItem[],
    options: Pick<MessageOptions, "indexLineItems">,
  ): string {
    return items.map((item, i) => this.formatLineItem(item, i, options)).join("\n");
  }

  private formatMessage(message: string, level: Level, opts?: LineItem[] | MessageOptions): string {
    let lineItems: LineItem[] = [];
    let count: [number, number] | null = null;
    let indexLineItems = false;
    if (opts) {
      if (Array.isArray(opts)) {
        lineItems = opts;
      } else {
        lineItems = opts.lineItems ?? [];
        count = opts.count ?? null;
        indexLineItems = opts.indexLineItems ?? false;
      }
    }
    let msg = message;
    if (count) {
      msg = `${msg} (${count[0] + 1}/${count[1]})`;
    }
    return lineItems && lineItems.length !== 0
      ? `${this.colorize(this.indent(msg, {}), level)}\n${this.formatLineItems(lineItems, {
          indexLineItems,
        })}`
      : this.colorize(this.indent(msg, {}), level);
  }

  public complete(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(this.formatMessage(message, "complete", opts));
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
