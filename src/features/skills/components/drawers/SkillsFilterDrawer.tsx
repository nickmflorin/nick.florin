import { useEffect } from "react";

import { type ApiSkill } from "~/database/model";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { Drawer } from "~/components/drawers/Drawer";
import { useForm } from "~/components/forms-v2/hooks";
import { Loading } from "~/components/loading/Loading";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/features/skills/components/forms/SkillsChartFilterForm";

export interface SkillsFilterDrawerProps extends ExtendingDrawerProps {
  readonly isLoading?: boolean;
  readonly filters: SkillsChartFilterFormValues;
  readonly skills: ApiSkill<[]>[];
  readonly filtersHaveChanged: boolean;
  readonly onClear: () => void;
  readonly onChange: (filters: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDrawer = ({
  filters,
  isLoading,
  filtersHaveChanged,
  skills,
  onClear,
  onClose,
  onChange,
}: SkillsFilterDrawerProps): JSX.Element => {
  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: "all" },
    onChange: ({ values }) => onChange?.(values),
  });

  useEffect(() => {
    setValues(filters);
  }, [filters, setValues]);

  return (
    <Drawer onClose={onClose}>
      <Drawer.Header>Filters</Drawer.Header>
      <Drawer.Content className="overflow-y-auto">
        <Loading isLoading={isLoading} className="z-auto">
          <SkillsChartFilterForm
            form={{ ...form, setValues }}
            skills={skills}
            isClearDisabled={!filtersHaveChanged}
            onClear={onClear}
          />
        </Loading>
      </Drawer.Content>
    </Drawer>
  );
};
