"use client";
import dynamic from "next/dynamic";

import { type ApiExperience } from "~/prisma/model";

import { deleteExperience, updateExperience } from "~/actions/mutations/experiences";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import type * as cells from "~/components/tables/generic/cells";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/generic/Provider";

const VisibleCell = dynamic(
  () => import("~/components/tables/generic/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const DetailsCell = dynamic(() => import("~/components/tables/generic/cells/DetailsCell"));

const EditableStringCell = dynamic(
  () => import("~/components/tables/generic/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const HighlightedCell = dynamic(
  () => import("~/components/tables/generic/cells/HighlightedCell"),
) as cells.HighlightedCellComponent;

const ReadOnlyDateTimeCell = dynamic(
  () => import("~/components/tables/generic/cells/ReadOnlyDateTimeCell"),
);

const CompanyCell = dynamic(() => import("./cells/CompanyCell"));
const SkillsCell = dynamic(() => import("./cells/SkillsCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiExperience<["details", "skills"]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiExperience<["details", "skills"]>>
      id="experiences-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the experience."
      deleteAction={async id => {
        await deleteExperience(id);
      }}
      onEdit={(id, m) =>
        open(ids.UPDATE_EXPERIENCE, { experienceId: id, eager: { title: m.title } })
      }
      columns={[
        {
          accessor: "title",
          title: "Title",
          width: 260,
          render: ({ model, table }) => (
            <EditableStringCell
              field="title"
              model={model}
              table={table}
              errorMessage="There was an error updating the experience."
              action={updateExperience.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "shortTitle",
          title: "Title (Abbv.)",
          width: 220,
          render: ({ model, table }) => (
            <EditableStringCell
              field="shortTitle"
              model={model}
              table={table}
              errorMessage="There was an error updating the experience."
              action={updateExperience.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "company",
          title: "Company",
          width: 260,
          render: ({ model, table }) => <CompanyCell experience={model} table={table} />,
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
          render: ({ model }) => <SkillsCell experience={model} />,
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
                await updateExperience(id, data);
              }}
              errorMessage="There was an error updating the experience."
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
                await updateExperience(id, data);
              }}
              errorMessage="There was an error updating the experience."
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
