"use client";
import dynamic from "next/dynamic";

import { type ApiSkill, type BrandSkill } from "~/prisma/model";

import { deleteSkill, updateSkill } from "~/actions/mutations/skills";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import type * as cells from "~/components/tables/cells";
import { type SlugCellComponent } from "~/components/tables/cells/SlugCell";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/Provider";

const VisibleCell = dynamic(
  () => import("~/components/tables/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const EditableStringCell = dynamic(
  () => import("~/components/tables/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SlugCell = dynamic(() => import("~/components/tables/cells/SlugCell")) as SlugCellComponent;

const ReadOnlyDateTimeCell = dynamic(
  () => import("~/components/tables/cells/ReadOnlyDateTimeCell"),
);

const ExperiencesCell = dynamic(() => import("./cells/ExperiencesCell"));
const EducationsCell = dynamic(() => import("./cells/EducationsCell"));
const ExperienceCell = dynamic(() => import("./cells/ExperienceCell"));
const ShowInTopSkillsCell = dynamic(() => import("./cells/ShowInTopSkillsCell"));
const CategoriesCell = dynamic(() => import("./cells/CategoriesCell"));
const ProgrammingLanguagesCell = dynamic(() => import("./cells/ProgrammingLanguagesCell"));
const ProjectsCell = dynamic(() => import("./cells/ProjectsCell"));
const RepositoriesCell = dynamic(() => import("./cells/RepositoriesCell"));

export interface TableViewConfig
  extends Pick<
    RootTableViewConfig<ApiSkill<["experiences", "educations", "projects", "repositories"]>>,
    "children"
  > {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiSkill<["experiences", "educations", "projects", "repositories"]>>
      id="skills-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the skill."
      deleteAction={async id => await deleteSkill(id)}
      onEdit={(id, m) => open(ids.UPDATE_SKILL, { skillId: id, eager: { label: m.label } })}
      columns={[
        {
          accessor: "label",
          title: "Label",
          width: 200,
          resizable: true,
          render: ({ model, table }) => (
            <EditableStringCell
              field="label"
              model={model}
              table={table}
              errorMessage="There was an error updating the skill."
              action={updateSkill.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "slug",
          title: "Slug",
          width: 200,
          render: ({ model, table }) => (
            <SlugCell<
              ApiSkill<["experiences", "educations", "projects", "repositories"]>,
              BrandSkill
            >
              model={model}
              modelType="skill"
              table={table}
              getSluggifiedFieldValue={m => m.label}
              action={async (id, value) => await updateSkill(id, { slug: value })}
            />
          ),
        },
        {
          accessor: "experiences",
          title: "Experiences",
          cellsClassName: "min-w-[200px] max-w-[320px]",
          render: ({ model, table }) => <ExperiencesCell skill={model} table={table} />,
        },
        {
          accessor: "educations",
          title: "Educations",
          cellsClassName: "min-w-[200px] max-w-[320px]",
          render: ({ model }) => <EducationsCell skill={model} />,
        },
        {
          accessor: "projects",
          title: "Projects",
          cellsClassName: "min-w-[200px] max-w-[320px]",
          render: ({ model, table }) => <ProjectsCell skill={model} table={table} />,
        },
        {
          accessor: "repositories",
          title: "Repositories",
          cellsClassName: "min-w-[200px] max-w-[320px]",
          render: ({ model, table }) => <RepositoriesCell skill={model} table={table} />,
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
          width: 220,
          defaultVisible: false,
          render: ({ model }) => <CategoriesCell skill={model} />,
        },
        {
          accessor: "programmingLanguages",
          title: "Prog. Languages",
          width: 220,
          defaultVisible: false,
          render: ({ model }) => <ProgrammingLanguagesCell skill={model} />,
        },
        {
          accessor: "createdAt",
          title: "Created",
          textAlign: "center",
          width: 170,
          render: ({ model }) => <ReadOnlyDateTimeCell date={model.createdAt} />,
        },
        {
          accessor: "updatedAt",
          title: "Updated",
          textAlign: "center",
          width: 170,
          render: ({ model }) => <ReadOnlyDateTimeCell date={model.updatedAt} />,
        },
        {
          accessor: "includeInTopSkills",
          title: "Top Skill",
          textAlign: "center",
          width: 100,
          render: ({ model, table }) => <ShowInTopSkillsCell skill={model} table={table} />,
        },
        {
          accessor: "visible",
          title: "Visible",
          width: 80,
          textAlign: "center",
          render: ({ model, table }) => (
            <VisibleCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateSkill(id, data);
              }}
              errorMessage="There was an error updating the skill."
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
