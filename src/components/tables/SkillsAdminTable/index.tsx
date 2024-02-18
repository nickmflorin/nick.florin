"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { deleteSkill } from "~/app/actions/deleteSkill";
import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";
import { Loading } from "~/components/views/Loading";

import { DeleteCell } from "../cells/DeleteCell";
import { type TableProps } from "../types";

const EducationsCell = dynamic(() => import("./cells/EducationsCell"), { ssr: false });
const ExperiencesCell = dynamic(() => import("./cells/ExperiencesCell"), { ssr: false });
const LabelCell = dynamic(() => import("./cells/LabelCell"), { ssr: false });
const ShowInTopSkillsCell = dynamic(() => import("./cells/ShowInTopSkillsCell"), { ssr: false });
const SlugCell = dynamic(() => import("./cells/SlugCell"), { ssr: false });
const ExperienceCell = dynamic(() => import("./cells/ExperienceCell"), { ssr: false });

const Table = dynamic(() => import("../Table"), {
  loading: () => <Loading loading={true} />,
}) as {
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
}: SkillsAdminTableProps): JSX.Element => {
  const [_, transition] = useTransition();
  const router = useRouter();
  return (
    <Table
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
          accessor: "delete",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <DeleteCell
              onDelete={async () => await deleteSkill(model.id)}
              onError={() => toast.error("There was an error deleting the skill.")}
              onSuccess={() => {
                transition(() => {
                  router.refresh();
                });
              }}
            />
          ),
        },
      ]}
      data={skills}
    />
  );
};
export default SkillsAdminTable;
