import type { JsonifiableModel } from "./types";

import type { PluralBrand } from "~/database/model";
import { pluralizeBrandModel } from "~/database/model";

export const JSON_FIXTURE_DIR = "./src/prisma/scripts/fixtures/json" as const;

type JsonFixtureFilePathOpts = {
  readonly live?: boolean;
};

type JsonFixtureDir<O extends JsonFixtureFilePathOpts> = O extends { live: true }
  ? typeof JSON_FIXTURE_DIR
  : `${typeof JSON_FIXTURE_DIR}/fake`;

type JsonFixtureFilePath<
  T extends string,
  O extends JsonFixtureFilePathOpts,
> = T extends `${infer L extends string}.json`
  ? `${JsonFixtureDir<O>}${L}.json`
  : `${JsonFixtureDir<O>}/${T}.json`;

const getJsonFixtureFilePath = <T extends string, O extends JsonFixtureFilePathOpts>(
  fileName: T,
  opts: O,
): [JsonFixtureDir<O>, JsonFixtureFilePath<T, O>] => {
  const dir = opts.live
    ? (JSON_FIXTURE_DIR as JsonFixtureDir<O>)
    : (`${JSON_FIXTURE_DIR}/fake` as JsonFixtureDir<O>);

  if (fileName.endsWith(".json")) {
    return [dir, `${dir}/${fileName}` as JsonFixtureFilePath<T, O>];
  }
  return [dir, `${dir}/${fileName}.json` as JsonFixtureFilePath<T, O>];
};

export const getModelJsonFixtureFilePath = <
  M extends JsonifiableModel,
  O extends JsonFixtureFilePathOpts,
>(
  model: M,
  opts: O,
): [JsonFixtureDir<O>, JsonFixtureFilePath<PluralBrand<M>, O>] => {
  const pluralForm = pluralizeBrandModel(model);
  return getJsonFixtureFilePath(pluralForm, opts);
};
