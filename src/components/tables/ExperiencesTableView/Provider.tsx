"use client";
import dynamic from "next/dynamic";

import type * as cells from "../cells";

import { type ApiExperience } from "~/prisma/model";
import { deleteExperience } from "~/actions/mutations/delete-experience";
import { updateExperience } from "~/actions/mutations/update-experience";
import { useDrawers } from "~/components/drawers/hooks";

import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "../Provider";

const VisibleCell = dynamic(() => import("../cells/VisibleCell")) as cells.VisibleCellComponent;

const DetailsCell = dynamic(() => import("./cells/DetailsCell"));

const EditableStringCell = dynamic(
  () => import("../cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const CompanyCell = dynamic(() => import("./cells/CompanyCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiExperience<{ details: true }>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiExperience<{ details: true }>>
      id="experiences-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the experience."
      deleteAction={async id => {
        await deleteExperience(id);
      }}
      onEdit={id => open(ids.UPDATE_EXPERIENCE, { experienceId: id })}
      columns={[
        {
          accessor: "title",
          title: "Title",
          width: 320,
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
          width: 320,
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
          width: 320,
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
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
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
