"use client";
import { type ApiExperience } from "~/prisma/model";
import { LinkOrText } from "~/components/typography/LinkOrText";

import { Table } from "../Table";

import { TitleCell, ActionsCell, ShortTitleCell } from "./cells";

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
        accessor: "shortTitle",
        title: "Short Title",
        width: 320,
        render: ({ model, table }) => <ShortTitleCell experience={model} table={table} />,
      },
      {
        accessor: "company",
        title: "Company",
        width: 320,
        render: ({ model }) => (
          <LinkOrText fontSize="sm" fontWeight="regular" url={model.company.websiteUrl}>
            {model.company.name}
          </LinkOrText>
        ),
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
