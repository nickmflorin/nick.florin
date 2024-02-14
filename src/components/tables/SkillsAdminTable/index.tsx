"use client";
import dynamic from "next/dynamic";

import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";

import { type TableProps } from "../types";

import { EducationsCell } from "./cells/EducationsCell";
import { ExperiencesCell } from "./cells/ExperiencesCell";
import { LabelCell } from "./cells/LabelCell";
import { ShowInTopSkillsCell } from "./cells/ShowInTopSkillsCell";
import { SlugCell } from "./cells/SlugCell";

const Table = dynamic(() => import("../Table"), { ssr: false }) as {
  <T extends { id: string }>(props: TableProps<T>): JSX.Element;
};

export interface SkillsAdminTableProps {
  readonly skills: ApiSkill[];
  // TODO: Consider doing these with a client side API request in the selects themselves.
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
  readonly educations: Omit<ApiEducation, "skills" | "details">[];
}

export const SkillsAdminTable = ({
  skills,
  experiences,
  educations,
}: SkillsAdminTableProps): JSX.Element => (
  <Table
    columns={[
      {
        accessor: "label",
        title: "Label",
        render: ({ model }) => <LabelCell skill={model} />,
      },
      {
        accessor: "slug",
        title: "Slug",
        render: ({ model }) => <SlugCell skill={model} />,
      },
      {
        accessor: "experiences",
        title: "Experiences",
        render: ({ model }) => <ExperiencesCell skill={model} experiences={experiences} />,
      },
      {
        accessor: "educations",
        title: "Educations",
        render: ({ model }) => <EducationsCell skill={model} educations={educations} />,
      },
      {
        accessor: "includeInTopSkills",
        title: "Top Skill",
        textAlign: "center",
        render: ({ model, table }) => <ShowInTopSkillsCell skill={model} table={table} />,
      },
    ]}
    data={skills}
  />
);
export default SkillsAdminTable;
