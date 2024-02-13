"use client";
import dynamic from "next/dynamic";

import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";

import { type TableProps } from "../types";

import { EducationsCell } from "./cells/EducationsCell";
import { ExperiencesCell } from "./cells/ExperiencesCell";
import { LabelCell } from "./cells/LabelCell";
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
        render: (skill: ApiSkill) => <LabelCell skill={skill} />,
      },
      {
        accessor: "slug",
        title: "Slug",
        render: (skill: ApiSkill) => <SlugCell skill={skill} />,
      },
      {
        accessor: "experiences",
        title: "Experiences",
        render: (skill: ApiSkill) => <ExperiencesCell skill={skill} experiences={experiences} />,
      },
      {
        accessor: "educations",
        title: "Educations",
        render: (skill: ApiSkill) => <EducationsCell skill={skill} educations={educations} />,
      },
    ]}
    data={skills}
  />
);
export default SkillsAdminTable;
