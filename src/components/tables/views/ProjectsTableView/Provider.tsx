"use client";
import dynamic from "next/dynamic";

import { type ApiProject } from "~/prisma/model";
import { deleteProject, updateProject } from "~/actions/mutations/projects";
import { useDrawers } from "~/components/drawers/hooks";
import type * as cells from "~/components/tables/generic/cells";
import { type SlugCellComponent } from "~/components/tables/generic/cells/SlugCell";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/generic/Provider";

const EditableStringCell = dynamic(
  () => import("~/components/tables/generic/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SlugCell = dynamic(
  () => import("~/components/tables/generic/cells/SlugCell"),
) as SlugCellComponent;

export interface TableViewConfig extends Pick<RootTableViewConfig<ApiProject<[]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiProject<[]>>
      id="projects-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the project."
      deleteAction={async id => await deleteProject(id)}
      onEdit={(id, m) => open(ids.UPDATE_PROJECT, { projectId: id, eager: { name: m.name } })}
      columns={[
        {
          accessor: "Name",
          title: "Name (Abbv.)",
          width: 320,
          render: ({ model, table }) => (
            <EditableStringCell
              field="name"
              model={model}
              table={table}
              errorMessage="There was an error updating the project."
              action={updateProject.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "shortName",
          title: "Name (Abbv.)",
          width: 320,
          render: ({ model, table }) => (
            <EditableStringCell
              field="shortName"
              model={model}
              table={table}
              errorMessage="There was an error updating the project."
              action={updateProject.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "slug",
          title: "Slug",
          width: 320,
          render: ({ model, table }) => (
            <SlugCell<ApiProject<[]>>
              model={model}
              modelType="project"
              table={table}
              getSluggifiedFieldValue={m => m.name}
              action={async (id, value) => await updateProject(id, { slug: value })}
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
