"use client";
import { type ApiEducation, type School } from "~/prisma/model";
import { deleteEducation } from "~/actions/delete-education";
import { updateEducation } from "~/actions/update-education";
import { Link } from "~/components/buttons";
import { useDrawerParams } from "~/components/drawers/hooks";

import { EditableStringCell, ActionsCell, VisibleCell } from "../cells";
import { Table } from "../Table";

import { SchoolCell } from "./cells";

interface DetailsCellProps {
  readonly model: ApiEducation<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawerParams();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EDUCATION_DETAILS, model.id)}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export interface ClientTableProps {
  readonly schools: School[];
  readonly educations: ApiEducation<{ details: true }>[];
}

export const ClientTable = ({ educations, schools }: ClientTableProps): JSX.Element => {
  const { open, ids } = useDrawerParams();

  return (
    <Table
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
          render: ({ model, table }) => (
            <SchoolCell education={model} schools={schools} table={table} />
          ),
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
              onEdit={() => open(ids.UPDATE_EDUCATION, model.id)}
            />
          ),
        },
      ]}
      data={educations}
    />
  );
};

export default ClientTable;
