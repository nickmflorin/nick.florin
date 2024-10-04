import type * as types from "./types";

import { IconButton } from "~/components/buttons";
import { DataSelect } from "~/components/input/select/DataSelect";

export interface FiltersSelectProps<F extends types.TableFilters> {
  readonly configuration: types.TableFiltersConfiguration<F>;
  readonly excludeFilters?: types.TableFilterId<F>[];
  readonly value: types.TableFilterId<F>[];
  readonly onChange: (filters: types.TableFilterId<F>[]) => void;
}

export const FiltersSelect = <F extends types.TableFilters>({
  configuration,
  excludeFilters = [],
  ...props
}: FiltersSelectProps<F>): JSX.Element => {
  const filtered = configuration.filter(
    config => !excludeFilters.includes(config.id) && config.isHideable !== false,
  );
  if (filtered.length === 0) {
    return <></>;
  }
  return (
    <DataSelect
      {...props}
      data={filtered.map(config => ({ value: config.id, label: config.label }))}
      popoverPlacement="bottom-end"
      options={{ behavior: "multi" }}
      inputClassName="w-[240px]"
      popoverClassName="z-50"
      popoverOffset={{ mainAxis: 4, crossAxis: -50 }}
      popoverWidth="available"
      popoverMaxHeight={260}
    >
      {({ ref, params, isOpen }) => (
        <IconButton.Transparent
          {...params}
          ref={ref}
          isActive={isOpen}
          element="button"
          icon="ellipsis-h"
          className="text-gray-500 hover:bg-gray-100"
          radius="full"
          activeClassName="text-blue-700 bg-gray-100"
          size="medium"
          onClick={e => {
            e.stopPropagation();
            if ("onClick" in params && typeof params.onClick === "function") {
              params.onClick?.(e);
            }
          }}
        />
      )}
    </DataSelect>
  );
};
