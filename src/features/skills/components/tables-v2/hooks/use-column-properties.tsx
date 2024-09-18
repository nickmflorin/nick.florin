import { useMemo } from "react";

// import { updateSkill } from "~/actions/mutations/skills";
import type { ActionVisibility } from "~/actions-v2";

/* import { EditableStringCell } from "~/components/tables/cells/EditableStringCell";
   import { ReadOnlyDateTimeCell } from "~/components/tables/cells/ReadOnlyDateTimeCell";
   import { SlugCell } from "~/components/tables/cells/SlugCell";
   import { VisibleCell } from "~/components/tables/cells/VisibleCell"; */
import { type DataTableColumnProperties } from "~/components/tables-v2";
import { type SkillsTableModel, type SkillsTableColumnId } from "~/features/skills";

export interface UseSkillsTableColumnPropertiesParams {
  readonly visibility: ActionVisibility;
}

export const useSkillsTableColumnProperties = ({
  visibility,
}: UseSkillsTableColumnPropertiesParams): DataTableColumnProperties<
  SkillsTableModel,
  SkillsTableColumnId
> =>
  useMemo(
    () => ({
      visible: {
        cellRenderer(datum) {
          return <></>;
          /* return (
               <VisibleCell
                 model={datum}
                 table={table}
                 action={async (id, data) => {
                   await updateSkill(id, data);
                 }}
                 errorMessage="There was an error updating the skill."
               />
             ); */
        },
      },
    }),
    [visibility],
  );
