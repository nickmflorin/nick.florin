import dynamic from "next/dynamic";
import { useEffect } from "react";

import { flip } from "@floating-ui/react";

import {
  ChartFilterButton,
  type ChartFilterButtonProps,
} from "~/components/buttons/ChartFilterButton";
import { PopoverContent } from "~/components/floating/PopoverContent";
import { useForm } from "~/components/forms/hooks/use-form";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/features/skills/components/forms/SkillsChartFilterForm";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const Popover = dynamic(() => import("~/components/floating/Popover"));

export interface SkillsFilterPopoverProps {
  readonly isDisabled?: boolean;
  readonly buttonProps?: Omit<ChartFilterButtonProps, "isDisabled">;
  readonly filters: SkillsChartFilterFormValues;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterPopover = ({
  isDisabled = false,
  buttonProps,
  filters,
  onChange,
}: SkillsFilterPopoverProps): JSX.Element => {
  const { isLessThan } = useScreenSizes();

  const { setValues, ...form } = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: "all" },
    onChange: ({ values }) => {
      onChange?.(values);
    },
  });

  useEffect(() => {
    setValues(filters);
  }, [filters, setValues]);

  return (
    <Popover
      placement="bottom-end"
      triggers={["click"]}
      offset={{ mainAxis: 4 }}
      width={400}
      withArrow={false}
      inPortal
      isDisabled={isDisabled}
      middleware={[flip({})]}
      content={
        <PopoverContent className="p-[20px] rounded-md overflow-y-auto">
          <SkillsChartFilterForm form={{ ...form, setValues }} isScrollable={false} />
        </PopoverContent>
      }
    >
      {({ ref, params }) => (
        <ChartFilterButton
          {...params}
          size={isLessThan("md") ? "xsmall" : "small"}
          {...buttonProps}
          ref={ref}
          isDisabled={isDisabled}
        />
      )}
    </Popover>
  );
};
