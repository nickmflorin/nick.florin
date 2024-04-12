"use client";
import dynamic from "next/dynamic";

import { type ApiCourse, type BrandCourse } from "~/prisma/model";
import { deleteCourse, updateCourse } from "~/actions/mutations/courses";
import { useDrawers } from "~/components/drawers/hooks";
import type * as cells from "~/components/tables/generic/cells";
import { type SlugCellComponent } from "~/components/tables/generic/cells/SlugCell";
import {
  TableViewProvider as RootTableViewProvider,
  type TableViewConfig as RootTableViewConfig,
} from "~/components/tables/generic/Provider";

const EditableStringCell = dynamic(
  () => import("~/components/tables/generic/cells/EditableStringCell"),
) as cells.EditableStringCellComponent;

const SlugCell = dynamic(
  () => import("~/components/tables/generic/cells/SlugCell"),
) as SlugCellComponent;

const EducationCell = dynamic(() => import("./cells/EducationCell"));

export interface TableViewConfig
  extends Pick<RootTableViewConfig<ApiCourse<["education"]>>, "children"> {}

export const TableViewProvider = ({ children }: TableViewConfig) => {
  const { open, ids } = useDrawers();
  return (
    <RootTableViewProvider<ApiCourse<["education"]>>
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
          width: 320,
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
          width: 320,
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
          width: 320,
          render: ({ model, table }) => (
            <SlugCell<ApiCourse<["education"]>, BrandCourse>
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
          width: 310,
          render: ({ model, table }) => <EducationCell course={model} table={table} />,
        },
      ]}
    >
      {children}
    </RootTableViewProvider>
  );
};

export default TableViewProvider;
