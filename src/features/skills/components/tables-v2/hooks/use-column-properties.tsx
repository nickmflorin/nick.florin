import { useMemo } from "react";

import { updateSkill } from "~/actions/mutations/skills";
import type { ActionVisibility } from "~/actions-v2";

import { EditableStringCell } from "~/components/tables/cells/EditableStringCell";
import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
import { SlugCell } from "~/components/tables/cells/SlugCell";
import { VisibleCell } from "~/components/tables/cells/VisibleCell";
import { type DataTableColumnProperties } from "~/components/tables-v2";
import { useDataTable } from "~/components/tables-v2/hooks";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills";

export const useSkillsTableColumnProperties = (): DataTableColumnProperties<
  SkillsTableModel,
  SkillsTableColumn
> => {
  const { setRowLoading } = useDataTable<SkillsTableModel, SkillsTableColumn>();
  return useMemo(
    () => ({
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
