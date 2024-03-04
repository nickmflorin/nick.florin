"use client";
import { type ApiEducation } from "~/prisma/model";
import { deleteEducation } from "~/actions/delete-education";
import { updateEducation } from "~/actions/update-education";
import { LinkOrText } from "~/components/typography/LinkOrText";

import { EditableStringCell, ActionsCell } from "../cells";
import { Table } from "../Table";

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
        render: ({ model }) => (
          <ActionsCell
            editQueryParam="updateEducationId"
            editQueryValue={model.id}
            deleteErrorMessage="There was an error deleting the education."
            deleteAction={deleteEducation.bind(null, model.id)}
          />
        ),
      },
    ]}
    data={educations}
  />
);

export default ClientTable;
