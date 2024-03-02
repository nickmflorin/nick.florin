"use client";
import { type ApiEducation } from "~/prisma/model";
import { updateEducation } from "~/actions/update-education";
import { LinkOrText } from "~/components/typography/LinkOrText";

import { EditableStringCell } from "../cells";
import { Table } from "../Table";

import { ActionsCell } from "./cells";

export interface ClientTableProps {
  readonly educations: ApiEducation[];
}

export const ClientTable = ({ educations }: ClientTableProps): JSX.Element => (
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
        title: "Short Major",
        width: 320,
        render: ({ model, table }) => (
          <EditableStringCell
            field="shortMajor"
            model={model}
            table={table}
            errorMessage="There was an error updating the experience."
            action={updateEducation.bind(null, model.id)}
          />
        ),
      },
      {
        accessor: "minor",
        title: "Minor",
        width: 320,
        render: ({ model, table }) => (
          <EditableStringCell
            field="minor"
            model={model}
            table={table}
            errorMessage="There was an error updating the experience."
            action={updateEducation.bind(null, model.id)}
          />
        ),
      },
      {
        accessor: "concentration",
        title: "Concentration",
        width: 320,
        render: ({ model, table }) => (
          <EditableStringCell
            field="concentration"
            model={model}
            table={table}
            errorMessage="There was an error updating the experience."
            action={updateEducation.bind(null, model.id)}
          />
        ),
      },
      {
        accessor: "school",
        title: "School",
        width: 320,
        render: ({ model }) => (
          <LinkOrText fontSize="sm" fontWeight="regular" url={model.school.websiteUrl}>
            {model.school.name}
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
    data={educations}
  />
);

export default ClientTable;
