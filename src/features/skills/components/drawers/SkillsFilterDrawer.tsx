import { useEffect } from "react";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { Drawer } from "~/components/drawers/Drawer";
import { useForm } from "~/components/forms/hooks";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/features/skills/components/forms/SkillsChartFilterForm";

export interface SkillsFilterDrawerProps extends ExtendingDrawerProps {
  readonly filters: SkillsChartFilterFormValues;
  readonly onChange: (filters: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDrawer = ({ filters, onChange }: SkillsFilterDrawerProps): JSX.Element => {
  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: "all" },
    onChange: ({ values }) => onChange?.(values),
  });

  useEffect(() => {
    setValues(filters);
  }, [filters, setValues]);

  return (
    <Drawer>
      <Drawer.Header>Filters</Drawer.Header>
      <Drawer.Content className="overflow-y-auto">
        <SkillsChartFilterForm form={{ ...form, setValues }} />
      </Drawer.Content>
    </Drawer>
  );
};
