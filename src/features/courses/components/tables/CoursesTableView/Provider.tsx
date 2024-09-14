"use client";
import dynamic from "next/dynamic";

import { type ApiCourse, type BrandCourse } from "~/prisma/model";

import { deleteCourse, updateCourse } from "~/actions/mutations/courses";

import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import type * as cells from "~/components/tables/cells";
import { type SlugCellComponent } from "~/components/tables/cells/SlugCell";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/Provider";

const EditableStringCell = dynamic(
  () => import("~/components/tables/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SlugCell = dynamic(() => import("~/components/tables/cells/SlugCell")) as SlugCellComponent;

const VisibleCell = dynamic(
  () => import("~/components/tables/cells/VisibleCell"),
) as cells.VisibleCellComponent;

const ReadOnlyDateTimeCell = dynamic(
  () => import("~/components/tables/cells/ReadOnlyDateTimeCell"),
);

const EducationCell = dynamic(() => import("./cells/EducationCell"));
const SkillsCell = dynamic(() => import("./cells/SkillsCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiCourse<["education", "skills"]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiCourse<["education", "skills"]>>
      id="courses-table"
      isCheckable={true}
      useCheckedRowsQuery={false}
      canToggleColumnVisibility={true}
      deleteErrorMessage="There was an error deleting the course."
      deleteAction={async id => await deleteCourse(id)}
      onEdit={(id, m) => open(ids.UPDATE_COURSE, { courseId: id, eager: { name: m.name } })}
      columns={[
        {
          accessor: "Name",
          title: "Name (Abbv.)",
          width: 240,
          render: ({ model, table }) => (
            <EditableStringCell
              field="name"
              model={model}
              table={table}
              errorMessage="There was an error updating the course."
              action={updateCourse.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "shortName",
          title: "Name (Abbv.)",
          width: 240,
          render: ({ model, table }) => (
            <EditableStringCell
              field="shortName"
              model={model}
              table={table}
              errorMessage="There was an error updating the course."
              action={updateCourse.bind(null, model.id)}
            />
          ),
        },
        {
          accessor: "slug",
          title: "Slug",
          width: 240,
          render: ({ model, table }) => (
            <SlugCell<ApiCourse<["education", "skills"]>, BrandCourse>
              model={model}
              modelType="course"
              table={table}
              getSluggifiedFieldValue={m => m.name}
              action={async (id, value) => await updateCourse(id, { slug: value })}
            />
          ),
        },
        {
          accessor: "education",
          title: "Education",
          width: 240,
          render: ({ model, table }) => <EducationCell course={model} table={table} />,
        },
        {
          accessor: "skills",
          title: "Skills",
          width: 320,
          textAlign: "center",
          render: ({ model }) => <SkillsCell course={model} />,
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
          accessor: "visible",
          title: "Visible",
          textAlign: "center",
          width: 80,
          render: ({ model, table }) => (
            <VisibleCell
              model={model}
              table={table}
              action={async (id, data) => {
                await updateCourse(id, data);
              }}
              errorMessage="There was an error updating the course."
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
