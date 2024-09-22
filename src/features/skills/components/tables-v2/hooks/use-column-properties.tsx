import { useMemo } from "react";

import { updateSkill } from "~/actions/mutations/skills";

import { VisibleCell } from "~/components/tables/cells/VisibleCell";
import { type DataTableColumnProperties } from "~/components/tables-v2";
import { ReadOnlyDateTimeCell } from "~/components/tables-v2/cells/ReadOnlyDateTimeCell";
import { useDataTable } from "~/components/tables-v2/hooks";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills";

export const useSkillsTableColumnProperties = (): DataTableColumnProperties<
  SkillsTableModel,
  SkillsTableColumn
> => {
  const { setRowLoading } = useDataTable<SkillsTableModel, SkillsTableColumn>();
  return useMemo(
    () => ({
      label: {
        cellRenderer(datum) {
          return datum.label;
        },
      },
      slug: {
        cellRenderer(datum) {
          return datum.slug;
        },
      },
      updatedAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.updatedAt} />;
        },
      },
      createdAt: {
        cellRenderer(datum) {
          return <ReadOnlyDateTimeCell date={datum.createdAt} />;
        },
      },
      visible: {
        cellRenderer(datum) {
          return (
            <VisibleCell
              model={datum}
              table={{ setRowLoading }}
              action={async (id, data) => {
                await updateSkill(id, data);
              }}
              errorMessage="There was an error updating the skill."
            />
          );
        },
      },
    }),
    [setRowLoading],
  );
};
