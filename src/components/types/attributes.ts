import { type HyphenCase, toHyphenCase } from '~/lib/formatters';
import { type ExtractValues } from '~/lib/types';

type DataAttributesInput = Record<string, boolean | string | undefined>;

export type DataAttr<S extends string> = S extends `is${infer R extends string}`
  ? DataAttr<R>
  : `data-attr-${HyphenCase<S>}`;

export const toDataAttr = <S extends string>(key: S): DataAttr<S> => {
  let k = key.trim();
  if (k.startsWith('is')) {
    k = k.slice(2);
  }
  /* The hyphenated key is typed as 'never' because the literal type of the key is widened to
     'string' by the transformations applied to it above. */
  const hyphenated: string = toHyphenCase(k);
  return `data-attr-${hyphenated}` as DataAttr<S>;
};

type DataAttrValue<T extends boolean | string | undefined> = [T] extends [string]
  ? Lowercase<T>
  : T extends true | undefined
    ? T
    : never;

type DataAttributeKeys<A extends DataAttributesInput> = ExtractValues<{
  [key in keyof A]: DataAttrValue<A[key]> extends never ? never : key;
}> &
  string;

export type DataAttributes<A extends DataAttributesInput> = {
  [key in DataAttributeKeys<A> as DataAttr<key>]: DataAttrValue<A[key]>;
};

export const parseDataAttributes = <A extends DataAttributesInput>(data: A): DataAttributes<A> => {
  const keys = Object.keys(data) as (keyof A & string)[];
  let result: DataAttributes<A> = {} as DataAttributes<A>;
  for (const key of keys) {
    const v = data[key];
    if (v) {
      const attrKey = toDataAttr(key);
      if (typeof v === 'string') {
        if (v.trim().length !== 0) {
          result = { ...result, [attrKey]: v.toLowerCase() };
        }
      } else {
        result = { ...result, [attrKey]: true };
      }
    }
  }
  return result;
};
