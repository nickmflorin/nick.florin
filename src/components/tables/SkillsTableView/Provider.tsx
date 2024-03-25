"use client";
import dynamic from "next/dynamic";

import type * as cells from "../cells";

import { type ApiSkill } from "~/prisma/model";
import { deleteSkill } from "~/actions/mutations/delete-skill";
import { updateSkill } from "~/actions/mutations/update-skill";
import { useDrawers } from "~/components/drawers/hooks";

import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "../Provider";

const VisibleCell = dynamic(() => import("../cells/VisibleCell")) as cells.VisibleCellComponent;

const EditableStringCell = dynamic(
  () => import("../cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SlugCell = dynamic(() => import("./cells/SlugCell"));
const ExperiencesCell = dynamic(() => import("./cells/ExperiencesCell"));
const EducationsCell = dynamic(() => import("./cells/EducationsCell"));
const ExperienceCell = dynamic(() => import("./cells/ExperienceCell"));
const ShowInTopSkillsCell = dynamic(() => import("./cells/ShowInTopSkillsCell"));
const CategoriesCell = dynamic(() => import("./cells/CategoriesCell"));
const ProgrammingLanguagesCell = dynamic(() => import("./cells/ProgrammingLanguagesCell"));

export interface TableViewConfig extends Pick<RootTableViewConfig<ApiSkill>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiSkill>
      id="skills-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the skill."
      deleteAction={async id => await deleteSkill(id)}
      onEdit={id => open(ids.UPDATE_SKILL, { skillId: id })}
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
          render: ({ model }) => <ExperiencesCell skill={model} />,
        },
        {
          accessor: "educations",
          title: "Educations",
          width: 310,
          render: ({ model }) => <EducationsCell skill={model} />,
        },
        {
          accessor: "experience",
          title: "Experience",
          textAlign: "center",
          defaultVisible: false,
          render: ({ model, table }) => <ExperienceCell skill={model} table={table} />,
        },
        {
          accessor: "categories",
          title: "Categories",
          width: 310,
          defaultVisible: false,
          render: ({ model }) => <CategoriesCell skill={model} />,
        },
        {
          accessor: "programmingLanguages",
          title: "Prog. Languages",
          width: 310,
          defaultVisible: false,
          render: ({ model }) => <ProgrammingLanguagesCell skill={model} />,
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
      ]}
    >
      {children}
    </RootTableViewProvider>
  );
};

export default TableViewProvider;
