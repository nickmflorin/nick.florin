"use client";
import { type ApiEducation, type School } from "~/prisma/model";
import { deleteEducation } from "~/actions/delete-education";
import { updateEducation } from "~/actions/update-education";
import { Link } from "~/components/buttons";
import { useMutableParams } from "~/hooks";

import { EditableStringCell, ActionsCell } from "../cells";
import { Table } from "../Table";

import { SchoolCell } from "./cells";

interface DetailsCellProps {
  readonly model: ApiEducation<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { set } = useMutableParams();
  return (
    <Link.Primary
      onClick={() => set("updateEducationDetailsId", model.id, { clear: "updateEducationId" })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export interface ClientTableProps {
  readonly schools: School[];
  readonly educations: ApiEducation<{ details: true }>[];
}

export const ClientTable = ({ educations, schools }: ClientTableProps): JSX.Element => {
  const { set } = useMutableParams();

  return (
    <Table
      isCheckable
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
          render: ({ model }) => <SchoolCell education={model} schools={schools} />,
        },
        {
          accessor: "details",
          title: "Details",
          width: 120,
          textAlign: "center",
          render: ({ model }) => <DetailsCell model={model} />,
        },
        {
          accessor: "actions",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage="There was an error deleting the education."
              deleteAction={deleteEducation.bind(null, model.id)}
              onEdit={() =>
                set("updateEducationId", model.id, { clear: "updateEducationDetailsId" })
              }
            />
          ),
        },
      ]}
      data={educations}
    />
  );
};

export default ClientTable;
