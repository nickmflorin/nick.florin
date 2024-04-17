"use client";
import dynamic from "next/dynamic";

import { type ApiRepository } from "~/prisma/model";
import { deleteRepository, updateRepository } from "~/actions/mutations/repositories";
import { RepositoryLink } from "~/components/buttons/RepositoryLink";
import { useDrawers } from "~/components/drawers/hooks";
import type * as cells from "~/components/tables/generic/cells";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/generic/Provider";

const EditableStringCell = dynamic(
  () => import("~/components/tables/generic/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const VisibleCell = dynamic(
  () => import("~/components/tables/generic/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const ReadOnlyDateTimeCell = dynamic(
  () => import("~/components/tables/generic/cells/ReadOnlyDateTimeCell"),
);

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiRepository<["projects"]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiRepository<["projects"]>>
      id="repositories-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the repository."
      deleteAction={async id => await deleteRepository(id)}
      onEdit={(id, m) => open(ids.UPDATE_REPOSITORY, { repositoryId: id, eager: { slug: m.slug } })}
      columns={[
        {
          accessor: "slug",
          title: "Slug",
          width: 320,
          render: ({ model, table }) => (
            <EditableStringCell
              field="slug"
              model={model}
              table={table}
              errorMessage="There was an error updating the project."
              action={updateRepository.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "url",
          title: "",
          textAlign: "center",
          width: 240,
          render: ({ model }) => <RepositoryLink repository={model} />,
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
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
          width: 80,
          render: ({ model, table }) => (
            <VisibleCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateRepository(id, data);
              }}
              errorMessage="There was an error updating the repository."
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
