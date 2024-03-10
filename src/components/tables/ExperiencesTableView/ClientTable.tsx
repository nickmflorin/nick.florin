"use client";
import { type ApiExperience } from "~/prisma/model";
import { deleteExperience } from "~/actions/delete-experience";
import { updateExperience } from "~/actions/update-experience";
import { Link } from "~/components/buttons/generic";
import { LinkOrText } from "~/components/typography/LinkOrText";
import { useMutableParams } from "~/hooks";

import { EditableStringCell, ActionsCell } from "../cells";
import { Table } from "../Table";

export interface ClientTableProps {
  readonly experiences: ApiExperience<{ details: true }>[];
}

interface DetailsCellProps {
  readonly model: ApiExperience<{ details: true }>;
}

const DetailsCell = ({ model }: DetailsCellProps) => {
  const { set } = useMutableParams();
  return (
    <Link.Primary
      onClick={() => set("updateExperienceDetailsId", model.id, { clear: "updateExperienceId" })}
    >{`${model.details.length} Details`}</Link.Primary>
  );
};

export const ClientTable = ({ experiences }: ClientTableProps): JSX.Element => {
  const { set } = useMutableParams();
  return (
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
          render: ({ model }) => (
            <LinkOrText fontSize="sm" fontWeight="regular" url={model.company.websiteUrl}>
              {model.company.name}
            </LinkOrText>
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
          accessor: "actions",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage="There was an error deleting the experience."
              deleteAction={deleteExperience.bind(null, model.id)}
              onEdit={() =>
                set("updateExperienceId", model.id, { clear: "updateExperienceDetailsId" })
              }
            />
          ),
        },
      ]}
      data={experiences}
    />
  );
};

export default ClientTable;
