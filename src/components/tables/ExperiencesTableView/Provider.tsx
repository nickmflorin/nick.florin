"use client";
import dynamic from "next/dynamic";

import type * as cells from "../cells";

import { type ApiExperience } from "~/prisma/model";
import { deleteExperience } from "~/actions/delete-experience";
import { updateExperience } from "~/actions/update-experience";
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

const CompanyCell = dynamic(() => import("./cells/CompanyCell"));

interface DetailsCellProps {
  readonly model: ApiExperience<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawers();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EXPERIENCE_DETAILS, { entityId: model.id })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

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
        {
          accessor: "actions",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage="There was an error deleting the experience."
              deleteAction={deleteExperience.bind(null, model.id)}
              onEdit={() => open(ids.UPDATE_EXPERIENCE, { experienceId: model.id })}
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
