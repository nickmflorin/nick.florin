"use client";
import { type ApiExperience } from "~/prisma/model";

import { Table } from "../Table";

import { TitleCell, ActionsCell } from "./cells";

export interface ClientTableProps {
  readonly experiences: ApiExperience[];
}

export const ClientTable = ({ experiences }: ClientTableProps): JSX.Element => (
  <Table
    isCheckable
    columns={[
      {
        accessor: "title",
        title: "Title",
        width: 320,
        render: ({ model, table }) => <TitleCell experience={model} table={table} />,
      },
      {
        accessor: "actions",
        title: "",
        textAlign: "center",
        render: ({ model }) => <ActionsCell model={model} />,
      },
    ]}
    data={experiences}
  />
);

export default ClientTable;
