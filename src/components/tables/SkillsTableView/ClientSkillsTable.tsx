"use client";
import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";
import { deleteSkill } from "~/actions/delete-skill";
import { updateSkill } from "~/actions/update-skill";
import { useDrawers } from "~/components/drawers/hooks";

import { EditableStringCell, ActionsCell, VisibleCell } from "../cells";
import { Table } from "../Table";

import {
  EducationsCell,
  ExperiencesCell,
  ExperienceCell,
  SlugCell,
  ShowInTopSkillsCell,
} from "./cells";

export interface ClientTableProps {
  readonly skills: ApiSkill[];
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
  readonly educations: ApiEducation[];
}

export const ClientTable = ({ skills, experiences, educations }: ClientTableProps): JSX.Element => {
  const { open, ids } = useDrawers();
  return (
    <Table
      columns={[
        {
          accessor: "label",
          title: "Label",
          width: 320,
          render: ({ model, table }) => (
            <EditableStringCell
              field="label"
              model={model}
              table={table}
              errorMessage="There was an error updating the experience."
              action={updateSkill.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "slug",
          title: "Slug",
          width: 320,
          render: ({ model, table }) => <SlugCell skill={model} table={table} />,
        },
        {
          accessor: "experiences",
          title: "Experiences",
          width: 310,
          render: ({ model }) => <ExperiencesCell skill={model} experiences={experiences} />,
        },
        {
          accessor: "educations",
          title: "Educations",
          width: 310,
          render: ({ model }) => <EducationsCell skill={model} educations={educations} />,
        },
        {
          accessor: "experience",
          title: "Experience",
          textAlign: "center",
          render: ({ model, table }) => <ExperienceCell skill={model} table={table} />,
        },
        {
          accessor: "includeInTopSkills",
          title: "Top Skill",
          textAlign: "center",
          render: ({ model, table }) => <ShowInTopSkillsCell skill={model} table={table} />,
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
                await updateSkill(id, data);
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
              deleteErrorMessage="There was an error deleting the skill."
              deleteAction={deleteSkill.bind(null, model.id)}
              onEdit={() => open(ids.UPDATE_SKILL, { skillId: model.id })}
            />
          ),
        },
      ]}
      data={skills}
    />
  );
};

export default ClientTable;
