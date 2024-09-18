"use client";
import dynamic from "next/dynamic";

import { type ApiEducation } from "~/database/model";

import { deleteEducation, updateEducation } from "~/actions/mutations/educations";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import type * as cells from "~/components/tables/cells";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/Provider";

const VisibleCell = dynamic(
  () => import("~/components/tables/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const EditableStringCell = dynamic(
  () => import("~/components/tables/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const HighlightedCell = dynamic(
  () => import("~/components/tables/cells/HighlightedCell"),
) as cells.HighlightedCellComponent;

const DetailsCell = dynamic(() => import("~/components/tables/cells/DetailsCell"));

const ReadOnlyDateTimeCell = dynamic(
  () => import("~/components/tables/cells/ReadOnlyDateTimeCell"),
);

const SchoolCell = dynamic(() => import("./cells/SchoolCell"));
const SkillsCell = dynamic(() => import("./cells/SkillsCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiEducation<["details", "skills"]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiEducation<["details", "skills"]>>
      id="educations-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the education."
      deleteAction={async id => {
        await deleteEducation(id);
      }}
      onEdit={(id, m) => open(ids.UPDATE_EDUCATION, { educationId: id, eager: { major: m.major } })}
      columns={[
        {
          accessor: "major",
          title: "Major",
          width: 240,
          render: ({ model, table }) => (
            <EditableStringCell
              field="major"
              model={model}
              table={table}
              errorMessage="There was an error updating the education."
              action={updateEducation.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "shortMajor",
          title: "Major (Abbv.)",
          width: 240,
          render: ({ model, table }) => (
            <EditableStringCell
              field="shortMajor"
              model={model}
              table={table}
              errorMessage="There was an error updating the education."
              action={updateEducation.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "school",
          title: "School",
          width: 240,
          render: ({ model, table }) => <SchoolCell education={model} table={table} />,
        },
        {
          accessor: "details",
          title: "Details",
          width: 120,
          textAlign: "center",
          render: ({ model }) => <DetailsCell model={model} />,
        },
        {
          accessor: "skills",
          title: "Skills",
          width: 320,
          textAlign: "center",
          render: ({ model }) => <SkillsCell education={model} />,
        },
        {
          accessor: "createdAt",
          title: "Created",
          textAlign: "center",
          width: 170,
          render: ({ model }) => <ReadOnlyDateTimeCell date={model.createdAt} />,
        },
        {
          accessor: "updatedAt",
          title: "Updated",
          textAlign: "center",
          width: 170,
          render: ({ model }) => <ReadOnlyDateTimeCell date={model.updatedAt} />,
        },
        {
          accessor: "highlighted",
          title: "Highlighted",
          textAlign: "center",
          width: 80,
          render: ({ model, table }) => (
            <HighlightedCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateEducation(id, data);
              }}
              errorMessage="There was an error updating the education."
            />
          ),
        },
        {
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
          width: 80,
          render: ({ model, table }) => (
            <VisibleCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateEducation(id, data);
              }}
              errorMessage="There was an error updating the education."
            />
          ),
        },
      ]}
    >
      {children}
    </RootTableViewProvider>
  );
};

export default TableViewProvider;
