"use client";
import dynamic from "next/dynamic";

import type * as cells from "../cells";

import { type ApiEducation } from "~/prisma/model";
import { deleteEducation } from "~/actions/delete-education";
import { updateEducation } from "~/actions/update-education";
import { Link } from "~/components/buttons";
import { useDrawers } from "~/components/drawers/hooks";

import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "../Provider";

const VisibleCell = dynamic(() => import("../cells/VisibleCell")) as cells.VisibleCellComponent;

const ActionsCell = dynamic(() => import("../cells/ActionsCell"));

const EditableStringCell = dynamic(
  () => import("../cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SchoolCell = dynamic(() => import("./cells/SchoolCell"));

interface DetailsCellProps {
  readonly model: ApiEducation<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawers();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EDUCATION_DETAILS, { entityId: model.id })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

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
        {
          accessor: "actions",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage="There was an error deleting the education."
              deleteAction={deleteEducation.bind(null, model.id)}
              onEdit={() => open(ids.UPDATE_EDUCATION, { educationId: model.id })}
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
