import type { Brand, BrandModel } from "~/database/model";
import { constructOrSearch } from "~/database/util";

type TabledBrand = Extract<Brand, "product" | "notification" | "productSubscription" | "user">;

type TableSearchableBrand = Extract<TabledBrand, "product" | "user">;

// Note: These may eventually have to be replaced with a dynamic page size query param.
export const PAGE_SIZES = {
  product: 20,
  notification: 20,
  productSubscription: 20,
  user: 20,
} as const satisfies { [key in TabledBrand]: number };

export const SEARCH_FIELDS = {
  product: ["slug", "name", "code"],
  user: ["firstName", "lastName", "emailAddress"],
} as const satisfies {
  [key in TableSearchableBrand]: (keyof BrandModel<key>)[];
};

export const constructTableSearchClause = (brand: TableSearchableBrand, search: string) =>
  constructOrSearch(search, [...SEARCH_FIELDS[brand]]);
