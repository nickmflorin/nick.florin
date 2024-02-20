"use client";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiSkill, type ApiExperience, type ApiEducation } from "~/prisma/model";
import { deleteSkill } from "~/actions/deleteSkill";
import { Loading } from "~/components/views/Loading";

import { ActionsCell } from "../cells/ActionsCell";
import { type TableProps } from "../types";

const EducationsCell = dynamic(() => import("./cells/EducationsCell"), { ssr: false });
const ExperiencesCell = dynamic(() => import("./cells/ExperiencesCell"), { ssr: false });
const LabelCell = dynamic(() => import("./cells/LabelCell"), { ssr: false });
const ShowInTopSkillsCell = dynamic(() => import("./cells/ShowInTopSkillsCell"), { ssr: false });
const SlugCell = dynamic(() => import("./cells/SlugCell"), { ssr: false });
const ExperienceCell = dynamic(() => import("./cells/ExperienceCell"), { ssr: false });
const VisibleCell = dynamic(() => import("./cells/VisibleCell"), { ssr: false });

const Table = dynamic(() => import("../Table"), {
  loading: () => <Loading loading={true} />,
}) as {
  <T extends { id: string }>(props: TableProps<T>): JSX.Element;
};

export interface SkillsAdminTableProps {
  readonly skills: ApiSkill[];
  // TODO: Consider doing these with a client side API request in the selects themselves.
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
  readonly educations: ApiEducation[];
}

export const SkillsAdminTable = ({
  skills,
  experiences,
  educations,
}: SkillsAdminTableProps): JSX.Element => {
  const [_, transition] = useTransition();
  const { refresh, replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
          render: ({ model, table }) => <VisibleCell skill={model} table={table} />,
        },
        {
          accessor: "actions",
          title: "",
          textAlign: "center",
          render: ({ model }) => (
            <ActionsCell
              onEdit={() => {
                const params = new URLSearchParams(searchParams);
                params.set("updateSkillId", model.id);
                replace(`${pathname}?${params.toString()}`);
              }}
              onDelete={async () => await deleteSkill(model.id)}
              onDeleteError={() => toast.error("There was an error deleting the skill.")}
              onDeleteSuccess={() => {
                transition(() => {
                  refresh();
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
