import * as terminal from "~/application/support/terminal";

type LineItem = {
  label: string;
  value: string;
};

type MessageOptions = {
  readonly lineItems?: LineItem[];
  readonly count?: [number, number];
};

export class SeedStdout {
  constructor() {}

  private formatLineItems(items: LineItem[]): string {
    return items.map(item => ` ${item.label}: ${item.value}`).join("\n");
  }

  private formatMessage(message: string, opts?: LineItem[] | MessageOptions): string {
    let lineItems: LineItem[] = [];
    let count: [number, number] | null = null;
    if (opts) {
      if (Array.isArray(opts)) {
        lineItems = opts;
      } else {
        lineItems = opts.lineItems ?? [];
        count = opts.count ?? null;
      }
    }
    let msg = message;
    if (count) {
      msg = `${msg} (${count[0] + 1}/${count[1]})`;
    }
    return lineItems ? `${msg}\n${this.formatLineItems(lineItems)}` : msg;
  }

  public complete(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.GREEN + this.formatMessage(message, opts) + terminal.RESET);
  }

  public info(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.GRAY + this.formatMessage(message, opts) + terminal.RESET);
  }

  public ok(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.BLUE + this.formatMessage(message, opts) + terminal.RESET);
  }

  public error(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.RED + this.formatMessage(message, opts) + terminal.RESET);
  }

  public begin(message: string, opts?: LineItem[] | MessageOptions): void {
    /* eslint-disable-next-line no-console */
    console.info(terminal.YELLOW + this.formatMessage(message, opts) + terminal.RESET);
  }
}

export const stdout = new SeedStdout();
