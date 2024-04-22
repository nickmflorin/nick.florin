"use client";
import { ChartFilterButton } from "~/components/buttons/ChartFilterButton";
import { Floating, type FloatingProps } from "~/components/floating/Floating";
import { FloatingContent } from "~/components/floating/FloatingContent";
import { useForm } from "~/components/forms/generic/hooks/use-form";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/components/forms/skills/SkillsChartFilterForm";
import type { ComponentProps } from "~/components/types";
import { useMutableParams } from "~/hooks";

export interface SkillsFilterDropdownMenuProps {
  readonly isDisabled?: boolean;
  readonly buttonProps?: ComponentProps & { readonly isLocked?: boolean };
  readonly useSearchParams?: boolean;
  readonly placement?: FloatingProps["placement"];
  readonly onChange?: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDropdownMenu = ({
  isDisabled = false,
  buttonProps,
  useSearchParams = false,
  placement = "bottom-end",
  onChange,
}: SkillsFilterDropdownMenuProps): JSX.Element => {
  const { set } = useMutableParams();

  const form = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: 12 },
    onChange: ({ values }) => {
      if (useSearchParams) {
        set({ filters: values });
      }
      onChange?.(values);
    },
  });

  return (
    <Floating
      placement={placement}
      triggers={["click"]}
      offset={{ mainAxis: 4 }}
      width={400}
      withArrow={false}
      isDisabled={isDisabled}
      content={
        <FloatingContent className="p-[20px] rounded-md overflow-y-auto" variant="white">
          <SkillsChartFilterForm form={form} isScrollable={false} />
        </FloatingContent>
      }
    >
      {({ ref, params }) => (
        <ChartFilterButton {...params} {...buttonProps} ref={ref} isDisabled={isDisabled} />
      )}
    </Floating>
  );
};

export default SkillsFilterDropdownMenu;
