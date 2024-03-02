"use client";
import { type ApiExperience } from "~/prisma/model";
import { updateExperience } from "~/actions/update-experience";
import { LinkOrText } from "~/components/typography/LinkOrText";

import { EditableStringCell } from "../cells";
import { Table } from "../Table";

import { ActionsCell } from "./cells";

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
        title: "Short Title",
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
