import { ReadonlyURLSearchParams } from "next/navigation";

import { isEqual } from "lodash-es";
import { type z } from "zod";

import { parseQueryParams } from "~/integrations/http";

type FilterConfig<S extends z.ZodType = z.ZodTypeAny> = S extends z.ZodType
  ? {
      readonly schema: S;
      readonly defaultValue: z.infer<S>;
      readonly equals?: (v: z.infer<S>, o: z.infer<S>) => boolean;
      readonly excludeWhen?: (v: z.infer<S>) => boolean;
    }
  : never;

export type BaseFiltersConfiguration = {
  [key in string]: FilterConfig;
};

type FiltersDefaultValues<C extends BaseFiltersConfiguration> = {
  [key in keyof C]: C[key] extends { defaultValue: infer V } ? V : never;
};

export type FiltersSchemas<C extends BaseFiltersConfiguration> = {
  [key in keyof C]: C[key] extends { schema: infer V } ? V : never;
};

export type ParsedFilters<C extends BaseFiltersConfiguration> = {
  [key in keyof C]: C[key] extends FilterConfig<infer S extends z.ZodType> ? z.infer<S> : never;
};

export class FiltersClass<C extends BaseFiltersConfiguration> {
  constructor(private readonly config: C) {
    this.config = config;
  }

  public get defaultValues(): FiltersDefaultValues<C> {
    let defaults = {} as FiltersDefaultValues<C>;
    for (const [field, { defaultValue }] of Object.entries(this.config)) {
      defaults = { ...defaults, [field]: defaultValue };
    }
    return defaults;
  }

  public get schemas(): FiltersSchemas<C> {
    let schemas = {} as FiltersSchemas<C>;
    for (const [field, { schema }] of Object.entries(this.config)) {
      schemas = { ...schemas, [field]: schema };
    }
    return schemas;
  }

  public contains(f: unknown): f is keyof C {
    return typeof f === "string" && Object.keys(this.config).includes(f);
  }

  public hasFilter(filters: Partial<ParsedFilters<C>>, f: keyof C) {
    const pruned = this.prune(filters);
    return pruned[f] !== undefined;
  }

  public add<F extends ParsedFilters<C>, K extends keyof C>(
    f: F,
    field: K,
    value: F[K],
  ): [F, F[K]] {
    const config = this.config[field];
    if (config.excludeWhen?.(value)) {
      f = { ...f, [field]: config.defaultValue };
      return [f, config.defaultValue] as const;
    }
    f = { ...f, [field]: value };
    return [f, value] as const;
  }

  public valuesAreEqual<K extends keyof C, F extends ParsedFilters<C>>(field: K, f: F[K], o: F[K]) {
    const eq = this.config[field].equals ?? isEqual;
    return eq(f, o);
  }

  public prune<F extends Partial<ParsedFilters<C>>>(filters: F) {
    let pruned: Partial<F> = {};
    for (const [field, value] of Object.entries(filters)) {
      const config = this.config[field];
      const excl = config.excludeWhen;
      if (!excl || excl(value) === false) {
        pruned = { ...pruned, [field]: value };
      }
    }
    return pruned;
  }

  public areEmpty(filters: Partial<ParsedFilters<C>>) {
    const pruned = this.prune(filters);
    return Object.keys(pruned).length === 0;
  }

  public parse(
    params:
      | URLSearchParams
      | ReadonlyURLSearchParams
      | Record<string, string | string[] | undefined>
      | string
      | null
      | undefined,
  ) {
    let f: ParsedFilters<C> = {} as ParsedFilters<C>;
    const parsed =
      params instanceof ReadonlyURLSearchParams || params instanceof URLSearchParams
        ? parseQueryParams(params.toString())
        : typeof params === "string"
          ? parseQueryParams(params)
          : (params ?? {});
    for (const [field, schema] of Object.entries(this.schemas)) {
      const config = this.config[field];

      if (parsed[field] !== undefined) {
        const parsedField = schema.safeParse(parsed[field]);
        if (parsedField.success) {
          [f] = this.add(f, field, parsedField.data);
        } else {
          f = { ...f, [field]: config.defaultValue };
        }
      } else {
        f = { ...f, [field]: config.defaultValue };
      }
    }
    return f;
  }
}

export const Filters = <C extends BaseFiltersConfiguration>(config: C) =>
  new FiltersClass<C>(config);
