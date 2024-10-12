import { ReadonlyURLSearchParams } from "next/navigation";

import { z } from "zod";

import { UnreachableCaseError } from "~/application/errors";
import { arraysHaveSameElements } from "~/lib/arrays";

import { parseQueryParams } from "~/integrations/http";

import { type FilterButtonInstance } from "~/components/buttons/FilterButton";
import { type DataSelectInstance, type DataSelectModel } from "~/components/input/select";

import { type Prettify } from "./types";

export type FilterType = "multi-string" | "multi-enum" | "flag" | "search";

type RawFilterConfigValue<T extends FilterType> = {
  "multi-string": string[];
  "multi-enum": string[];
  flag: boolean | null;
  search: string;
}[T];

type Typeguard<T, R extends T = T> = (v: T) => v is R;

type BaseFilterConfig<
  T extends FilterType = FilterType,
  D extends RawFilterConfigValue<T> = RawFilterConfigValue<T>,
> = T extends FilterType
  ? {
      readonly type: T;
      readonly defaultValue?: D;
    }
  : never;

type MultiEnumFilterConfig<
  E extends string = string,
  D extends RawFilterConfigValue<"multi-enum"> = RawFilterConfigValue<"multi-enum">,
> = BaseFilterConfig<"multi-enum", D> & {
  readonly typeguard: Typeguard<string, E>;
};

type MultiStringFilterConfig<
  D extends RawFilterConfigValue<"multi-string"> = RawFilterConfigValue<"multi-string">,
> = BaseFilterConfig<"multi-string", D> & {
  readonly typeguard?: Typeguard<string>;
};

type BooleanFilterConfig<D extends RawFilterConfigValue<"flag"> = RawFilterConfigValue<"flag">> =
  BaseFilterConfig<"flag", D>;

type StringFilterConfig<D extends RawFilterConfigValue<"search"> = RawFilterConfigValue<"search">> =
  BaseFilterConfig<"search", D>;

type FilterConfig =
  | MultiEnumFilterConfig
  | MultiStringFilterConfig
  | BooleanFilterConfig
  | StringFilterConfig;

type FilterConfigRefObj<C extends FilterConfig> = C extends {
  type: "multi-enum";
  typeguard: (v: string) => v is infer E extends string;
}
  ? DataSelectInstance<DataSelectModel<E>, { behavior: "multi" }> | null
  : C extends { type: "multi-string" }
    ? DataSelectInstance<DataSelectModel<string>, { behavior: "multi" }> | null
    : C extends { type: "flag" }
      ? FilterButtonInstance | null
      : C extends { type: "search" }
        ? HTMLInputElement | null
        : never;

type FilterConfigRef<C extends FilterConfig> = C extends {
  type: "multi-enum";
}
  ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Would be nice to fix this, but
       it's complicated. */
    React.MutableRefObject<DataSelectInstance<any, { behavior: "multi" }> | null>
  : C extends { type: "multi-string" }
    ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- Would be nice to fix this,
         but it's complicated. */
      React.MutableRefObject<DataSelectInstance<any, { behavior: "multi" }> | null>
    : C extends { type: "flag" }
      ? React.MutableRefObject<FilterButtonInstance | null>
      : C extends { type: "search" }
        ? React.MutableRefObject<HTMLInputElement | null>
        : never;

type FilterConfigDefaultValue<C extends FilterConfig> = C extends {
  defaultValue: infer V extends FilterConfigValue<C>;
}
  ? V
  : C extends { type: "multi-enum"; typeguard: (v: string) => v is infer E extends string }
    ? E[]
    : C extends { type: "multi-string" }
      ? string[]
      : C extends { type: "flag" }
        ? boolean | null
        : C extends { type: "search" }
          ? string
          : never;

type FilterConfigValue<C extends FilterConfig> = C extends {
  type: "multi-enum";
  typeguard: (v: string) => v is infer E extends string;
}
  ? E[]
  : C extends { type: "multi-string" }
    ? string[]
    : C extends { type: "flag" }
      ? boolean | null
      : C extends { type: "search" }
        ? string
        : never;

const DefaultFilterConfigDefaultValue = {
  "multi-enum": [],
  "multi-string": [],
  flag: null,
  search: "",
} as const satisfies { [key in FilterConfig as key["type"]]: FilterConfigDefaultValue<key> };

type InferE<C extends FilterConfig> = C extends {
  type: "multi-enum";
  typeguard: (v: string) => v is infer E extends string;
}
  ? E
  : never;

type FilterConfigSchema<C extends FilterConfig> = {
  "multi-enum": z.ZodEffects<
    z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>,
    InferE<C>[],
    string | string[]
  >;
  "multi-string": z.ZodEffects<
    z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>,
    string[],
    string | string[]
  >;
  flag: z.ZodEffects<
    z.ZodUnion<[z.ZodString, z.ZodNull, z.ZodBoolean]>,
    boolean | null,
    string | boolean | null
  >;
  search: z.ZodString;
}[C["type"]];

type FilterConfigField<C extends BaseFiltersConfiguration> = keyof C & string;

const getFilterSchema = <C extends FilterConfig>(config: C): FilterConfigSchema<C> => {
  switch (config.type) {
    case "multi-string":
      return z.union([z.string(), z.array(z.string())]).transform(value => {
        if (typeof value === "string") {
          if (config.typeguard !== undefined) {
            return config.typeguard(value) ? [value] : [];
          }
          return [value];
        }
        return value.reduce((prev, curr) => {
          if (config.typeguard !== undefined) {
            return config.typeguard(curr) ? [...prev, curr] : prev;
          }
          return [...prev, curr];
        }, [] as string[]);
      }) as FilterConfigSchema<C>;
    case "multi-enum":
      return z.union([z.string(), z.array(z.string())]).transform(value => {
        const guard = config.typeguard as (v: string) => v is InferE<C>;
        if (typeof value === "string") {
          return guard(value) ? [value] : [];
        }
        return value.reduce(
          (prev, curr) => (guard(curr) ? [...prev, curr] : prev),
          [] as InferE<C>[],
        );
      }) as FilterConfigSchema<C>;
    case "flag":
      return z.union([z.string(), z.null(), z.boolean()]).transform(v => {
        if (typeof v === "boolean" || v === null) {
          return v;
        } else if (typeof v === "string" && v.trim().toLocaleLowerCase() === "true") {
          return true;
        } else if (typeof v === "string" && v.trim().toLocaleLowerCase() === "false") {
          return false;
        }
        return null;
      }) as FilterConfigSchema<C>;
    case "search":
      return z.string() as FilterConfigSchema<C>;
    default:
      throw new UnreachableCaseError();
  }
};

type FilterConfigComparator<C extends FilterConfig> = (
  a: FilterConfigValue<C>,
  b: FilterConfigValue<C>,
) => boolean;

const FilterConfigComparators = {
  "multi-string": (a: string[], b: string[]) => arraysHaveSameElements(a, b),
  "multi-enum": <E extends string>(a: E[], b: E[]) => arraysHaveSameElements(a, b),
  flag: (a: boolean | null, b: boolean | null) => a === b,
  search: (a: string, b: string) => a === b,
} as const satisfies {
  [key in FilterConfig as key["type"]]: FilterConfigComparator<key>;
};

type FilterConfigExclusion<C extends FilterConfig> = (a: FilterConfigValue<C>) => boolean;

const FilterConfigExclusion = {
  "multi-string": v => v.length === 0,
  "multi-enum": <E extends string>(v: E[]) => v.length === 0,
  flag: v => v === null,
  search: v => v.trim().length === 0,
} as const satisfies {
  [key in FilterConfig as key["type"]]: FilterConfigExclusion<key>;
};

type FilterConfigRefClearer<C extends FilterConfig> = (ref: FilterConfigRef<C>) => void;

const FilterConfigRefClearers = {
  "multi-enum": ref => ref.current?.clear(),
  "multi-string": ref => ref.current?.clear(),
  flag: ref => ref.current?.clear(),
  search: ref => {
    if (ref.current) {
      ref.current.value = "";
    }
  },
} as const satisfies { [key in FilterConfig as key["type"]]: FilterConfigRefClearer<key> };

type FilterConfigRefSetter<C extends FilterConfig> = (
  ref: FilterConfigRef<C>,
  value: FilterConfigValue<C>,
) => void;

const FilterConfigRefSetters = {
  "multi-enum": (ref, v) => ref.current?.setValue(v),
  "multi-string": (ref, v) => ref.current?.setValue(v),
  flag: (ref, v) => ref.current?.setValue(v),
  search: (ref, v) => {
    if (ref.current) {
      ref.current.value = v;
    }
  },
} as const satisfies { [key in FilterConfig as key["type"]]: FilterConfigRefSetter<key> };

export type BaseFiltersConfiguration = {
  [key in string]: FilterConfig;
};

type FiltersConfigDefaultValues<C extends BaseFiltersConfiguration> = {
  [key in FilterConfigField<C>]: FilterConfigDefaultValue<C[key]>;
};

export type FiltersConfigValues<C extends BaseFiltersConfiguration> = {
  [key in FilterConfigField<C>]: FilterConfigValue<C[key]>;
};

export class FilterField<K extends string, C extends FilterConfig> {
  constructor(
    public readonly field: K,
    public readonly config: C,
  ) {
    this.config = config;
    this.field = field;
  }

  public get type(): C["type"] {
    return this.config.type;
  }

  public get defaultValue(): FilterConfigDefaultValue<C> {
    const d = this.config.defaultValue as FilterConfigDefaultValue<C> | undefined;
    const defaultD = DefaultFilterConfigDefaultValue[
      this.config.type
    ] as FilterConfigDefaultValue<C>;
    return d === undefined ? defaultD : d;
  }

  public get schema(): FilterConfigSchema<C> {
    return getFilterSchema(this.config);
  }

  public valuesAreEqual(f: FilterConfigValue<C>, o: FilterConfigValue<C>) {
    const comparator = FilterConfigComparators[this.config.type] as FilterConfigComparator<C>;
    return comparator(f, o);
  }

  public shouldBeExcluded(value: FilterConfigValue<C>) {
    const exclusion = FilterConfigExclusion[this.config.type] as FilterConfigExclusion<C>;
    return exclusion(value) === true;
  }

  public clearRefValue(ref: FilterConfigRef<C>) {
    const clearer = FilterConfigRefClearers[this.config.type] as FilterConfigRefClearer<C>;
    clearer(ref);
  }

  public setRefValue(ref: FilterConfigRef<C>, value: FilterConfigValue<C>) {
    const setter = FilterConfigRefSetters[this.config.type] as FilterConfigRefSetter<C>;
    setter(ref, value);
  }
}

export type FiltersFields<C extends BaseFiltersConfiguration> = {
  [key in FilterConfigField<C>]: FilterField<key, C[key]>;
};

export class Filters<C extends BaseFiltersConfiguration = BaseFiltersConfiguration> {
  public readonly fields: FiltersFields<C>;

  constructor(public readonly config: C) {
    this.config = config;

    this.fields = {} as FiltersFields<C>;
    for (const [field, config] of Object.entries(this.config)) {
      this.fields[field as FilterConfigField<C>] = new FilterField(
        field,
        config as C[typeof field],
      );
    }
  }

  public static multiEnum<E extends string, D extends E[]>(
    typeguard: Typeguard<string, E>,
    options?: { defaultValue?: D },
  ): MultiEnumFilterConfig<E, D> {
    return {
      ...options,
      type: "multi-enum",
      typeguard,
    };
  }

  public static multiString<D extends string[]>(options?: {
    readonly defaultValue?: D;
    readonly typeguard?: Typeguard<string>;
  }): MultiStringFilterConfig<D> {
    return {
      ...options,
      type: "multi-string",
    };
  }

  public static search<D extends string>(options?: {
    readonly defaultValue?: D;
  }): StringFilterConfig<D> {
    return {
      ...options,
      type: "search",
    };
  }

  public static flag<D extends boolean>(options?: {
    readonly defaultValue?: D;
  }): BooleanFilterConfig<D> {
    return {
      ...options,
      type: "flag",
    };
  }

  public get defaultValues(): FiltersDefaultValues<typeof this> {
    let defaults = {} as FiltersConfigDefaultValues<C>;
    for (const [field, obj] of Object.entries(this.fields)) {
      defaults = {
        ...defaults,
        [field]: obj.defaultValue,
      };
    }
    return defaults;
  }

  public get schemas(): FiltersSchemas<typeof this> {
    let schemas = {} as FiltersSchemas<typeof this>;
    for (const [field, obj] of Object.entries(this.fields)) {
      schemas = { ...schemas, [field]: obj.schema };
    }
    return schemas;
  }

  public getField<K extends FilterConfigField<C>>(field: K) {
    return this.fields[field];
  }

  public contains(f: unknown): f is FilterConfigField<C> {
    return typeof f === "string" && Object.keys(this.config).includes(f);
  }

  public hasFilter(filters: Partial<FiltersValues<typeof this>>, f: FilterFieldName<typeof this>) {
    const pruned = this.prune(filters);
    return pruned[f] !== undefined;
  }

  public clearFieldRefValue<K extends FilterFieldName<typeof this>>(
    field: K,
    refs: FilterRefs<typeof this>,
  ) {
    this.getField(field).clearRefValue(refs[field]);
  }

  public setFieldRefValue<K extends FilterFieldName<typeof this>>(
    field: K,
    value: FilterValue<K, typeof this>,
    refs: FilterRefs<typeof this>,
  ) {
    this.getField(field).setRefValue(refs[field], value);
  }

  public add<F extends FiltersValues<typeof this>, K extends FilterFieldName<typeof this>>(
    f: F,
    field: K,
    value: FilterValue<K, typeof this>,
  ): [F, FilterValue<K, typeof this>] {
    if (this.fieldShouldBeExcluded(field, value)) {
      f = { ...f, [field]: this.getField(field).defaultValue };
      return [f, this.getField(field).defaultValue] as const;
    }
    f = { ...f, [field]: value };
    return [f, value] as const;
  }

  public fieldValuesAreEqual<K extends FilterConfigField<C>>(
    field: K,
    f: FilterValue<K, typeof this>,
    o: FilterValue<K, typeof this>,
  ) {
    return this.getField(field).valuesAreEqual(f, o);
  }

  private fieldShouldBeExcluded<K extends FilterFieldName<typeof this>>(
    field: K,
    value: FilterValue<K, typeof this>,
  ) {
    return this.getField(field).shouldBeExcluded(value);
  }

  public prune<F extends Partial<FiltersValues<typeof this>>>(filters: F) {
    let pruned: Partial<F> = {};
    for (const [key, obj] of Object.entries(this.fields)) {
      const k = key as FilterFieldName<typeof this>;
      const field = obj as FilterField<typeof k, C[typeof k]>;
      const v = filters[k] as FilterValue<typeof k, typeof this> | undefined;
      if (v !== undefined && !field.shouldBeExcluded(v)) {
        pruned = { ...pruned, [k]: v };
      }
    }
    return pruned;
  }

  public areEmpty(filters: Partial<FiltersValues<typeof this>>) {
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
  ): FiltersValues<typeof this> {
    let f: FiltersValues<typeof this> = {} as FiltersValues<typeof this>;
    const parsed =
      params instanceof ReadonlyURLSearchParams || params instanceof URLSearchParams
        ? parseQueryParams(params.toString())
        : typeof params === "string"
          ? parseQueryParams(params)
          : (params ?? {});
    for (const [key, obj] of Object.entries(this.fields)) {
      const k = key as FilterFieldName<typeof this>;
      const field = obj as FilterField<typeof k, C[typeof k]>;
      const schema = field.schema as FilterConfigSchema<C[typeof k]>;
      if (parsed[k] !== undefined) {
        const parsedField = schema.safeParse(parsed[k]);
        if (parsedField.success) {
          [f] = this.add(f, k, parsedField.data as FilterConfigValue<C[typeof k]>);
        } else {
          f = { ...f, [k]: field.defaultValue };
        }
      } else {
        f = { ...f, [k]: field.defaultValue };
      }
    }
    return f;
  }
}

export type FiltersConfig<F extends { config: unknown }> = F extends {
  config: infer C extends BaseFiltersConfiguration;
}
  ? C
  : never;

export type FilterFieldName<F extends Filters> = keyof FiltersConfig<F> &
  string &
  keyof F["fields"];

export type FilterValue<K extends FilterFieldName<F>, F extends Filters> = FilterConfigValue<
  FiltersConfig<F>[K]
>;

export type FiltersValues<F extends Filters> = Prettify<{
  [key in FilterFieldName<F>]: FilterValue<key, F>;
}>;

export type FilterDefaultValue<
  K extends FilterFieldName<F>,
  F extends Filters,
> = FilterConfigDefaultValue<FiltersConfig<F>[K]>;

export type FiltersDefaultValues<F extends Filters> = Prettify<{
  [key in FilterFieldName<F>]: FilterDefaultValue<key, F>;
}>;

export type FilterSchema<K extends FilterFieldName<F>, F extends Filters> = FilterConfigSchema<
  FiltersConfig<F>[K]
>;

export type FiltersSchemas<F extends Filters> = {
  [key in FilterFieldName<F>]: FilterSchema<key, F>;
};

export type FilterRefObj<K extends FilterFieldName<F>, F extends Filters> = FilterConfigRefObj<
  FiltersConfig<F>[K]
>;

export type FilterRef<K extends FilterFieldName<F>, F extends Filters> = FilterConfigRef<
  FiltersConfig<F>[K]
>;

export type FilterRefs<F extends Filters> = { [key in FilterFieldName<F>]: FilterRef<key, F> };
