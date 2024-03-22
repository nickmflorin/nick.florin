"use client";
import { type ApiExperience, type Company } from "~/prisma/model";
import { deleteExperience } from "~/actions/delete-experience";
import { updateExperience } from "~/actions/update-experience";
import { Link } from "~/components/buttons/generic";
import { useDrawerParams } from "~/components/drawers/hooks";

import { EditableStringCell, ActionsCell, VisibleCell } from "../cells";
import { Table } from "../Table";

import { CompanyCell } from "./cells";

export interface ClientTableProps {
  readonly companies: Company[];
  readonly experiences: ApiExperience<{ details: true }>[];
}

interface DetailsCellProps {
  readonly model: ApiExperience<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { open, ids } = useDrawerParams();
  return (
    <Link.Primary
      onClick={() => open(ids.UPDATE_EXPERIENCE_DETAILS, model.id)}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export const ClientTable = ({ experiences, companies }: ClientTableProps): JSX.Element => {
  const { open, ids } = useDrawerParams();
  return (
    <Table
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
          render: ({ model, table }) => (
            <CompanyCell companies={companies} experience={model} table={table} />
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
              onEdit={() => open(ids.UPDATE_EXPERIENCE, model.id)}
            />
          ),
        },
      ]}
      data={experiences}
    />
  );
};

export default ClientTable;
