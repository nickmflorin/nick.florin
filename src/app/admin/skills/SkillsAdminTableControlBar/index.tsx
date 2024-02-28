import clsx from "clsx";

import { decodeQueryParam } from "~/lib/urls";
import { getEducations } from "~/fetches/get-educations";
import { IconButton } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

import { type SkillsTableFilters } from "../types";

import { EducationFilter } from "./EducationFilter";

export interface SkillsAdminTableControlBarProps extends ComponentProps {
  readonly checkedRows?: string;
  readonly filters: SkillsTableFilters;
}

export const SkillsAdminTableControlBar = async ({
  checkedRows: _checkedRows,
  filters,
  ...props
}: SkillsAdminTableControlBarProps) => {
  const checkedRows = _checkedRows
    ? decodeQueryParam(_checkedRows, { form: ["array"] as const }) ?? []
    : [];
  const educations = await getEducations({ skills: true });

  return (
    <div {...props} className={clsx("flex flex-row gap-[8px] items-center", props.className)}>
      <IconButton.Danger icon={{ name: "trash-alt" }} isDisabled={checkedRows.length === 0} />
      <EducationFilter educations={educations} filters={filters} />
    </div>
  );
};

export default SkillsAdminTableControlBar;
