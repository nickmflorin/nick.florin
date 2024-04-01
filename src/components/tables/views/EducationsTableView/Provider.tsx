"use client";
import dynamic from "next/dynamic";

import type * as cells from "../../generic/cells";

import { type ApiEducation } from "~/prisma/model";
import { deleteEducation } from "~/actions/mutations/delete-education";
import { updateEducation } from "~/actions/mutations/update-education";
import { useDrawers } from "~/components/drawers/hooks";

import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "../../generic/Provider";

const VisibleCell = dynamic(
  () => import("../../generic/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const EditableStringCell = dynamic(
  () => import("../../generic/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SchoolCell = dynamic(() => import("./cells/SchoolCell"));
const DetailsCell = dynamic(() => import("./cells/DetailsCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiEducation<{ details: true }>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiEducation<{ details: true }>>
      id="educations-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the education."
      deleteAction={async id => {
        await deleteEducation(id);
      }}
      onEdit={id => open(ids.UPDATE_EDUCATION, { educationId: id })}
      columns={[
        {
          accessor: "major",
          title: "Major",
          width: 320,
          render: ({ model, table }) => (
            <EditableStringCell
              field="major"
              model={model}
              table={table}
              errorMessage="There was an error updating the experience."
              action={updateEducation.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "shortMajor",
          title: "Major (Abbv.)",
          width: 320,
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
          width: 320,
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
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
          render: ({ model, table }) => (
            <VisibleCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateEducation(id, data);
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
