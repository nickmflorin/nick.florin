"use client";
import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";

import { Table } from "../Table";

import {
  EducationsCell,
  ExperiencesCell,
  LabelCell,
  ExperienceCell,
  SlugCell,
  VisibleCell,
  ShowInTopSkillsCell,
  ActionsCell,
} from "./cells";

export interface ClientTableProps {
  readonly skills: ApiSkill[];
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
  readonly educations: ApiEducation[];
}

export const ClientTable = ({ skills, experiences, educations }: ClientTableProps): JSX.Element => (
  <Table
    isCheckable
    columns={[
      {
        accessor: "label",
        title: "Label",
        width: 320,
        render: ({ model, table }) => <LabelCell skill={model} table={table} />,
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
        render: ({ model, table }) => <VisibleCell skill={model} table={table} />,
      },
      {
        accessor: "actions",
        title: "",
        textAlign: "center",
        render: ({ model }) => <ActionsCell model={model} />,
      },
    ]}
    data={skills}
  />
);

export default ClientTable;
