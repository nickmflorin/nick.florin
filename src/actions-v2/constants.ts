import type { Brand, BrandModel } from "~/database/model";
import { constructOrSearch } from "~/database/util";

type TabledBrand = Extract<
  Brand,
  "skill" | "course" | "experience" | "education" | "project" | "repository"
>;

// Note: These may eventually have to be replaced with a dynamic page size query param.
export const PAGE_SIZES = {
  skill: 16,
  course: 16,
  experience: 8,
  education: 8,
  project: 8,
  repository: 8,
} as const satisfies { [key in TabledBrand]: number };

export const SEARCH_FIELDS = {
  skill: ["slug", "label"],
  course: ["name", "shortName", "slug"],
  experience: ["title", "shortTitle"],
  education: ["major", "concentration", "minor"],
  project: ["name", "shortName", "slug"],
  repository: ["slug", "npmPackageName"],
} as const satisfies {
  [key in TabledBrand]: (keyof BrandModel<key>)[];
};

export const constructTableSearchClause = (brand: TabledBrand, search: string) =>
  constructOrSearch(search, [...SEARCH_FIELDS[brand]]);
