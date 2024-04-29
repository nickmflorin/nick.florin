"use client";
import dynamic from "next/dynamic";

import {
  ChartFilterButton,
  type ChartFilterButtonProps,
} from "~/components/buttons/ChartFilterButton";
import { type PopoverProps } from "~/components/floating/Popover";
import { PopoverContent } from "~/components/floating/PopoverContent";
import { useForm } from "~/components/forms/generic/hooks/use-form";
import {
  SkillsChartFilterForm,
  SkillsChartFilterFormSchema,
  type SkillsChartFilterFormValues,
} from "~/components/forms/skills/SkillsChartFilterForm";
import { useMutableParams } from "~/hooks";
import { useScreenSizes } from "~/hooks/use-screen-sizes";

const Popover = dynamic(() => import("~/components/floating/Popover"));

export interface SkillsFilterDropdownMenuProps {
  readonly isDisabled?: boolean;
  readonly buttonProps?: Omit<ChartFilterButtonProps, "isDisabled">;
  readonly useSearchParams?: boolean;
  readonly placement?: PopoverProps["placement"];
  readonly onChange?: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterDropdownMenu = ({
  isDisabled = false,
  buttonProps,
  useSearchParams = false,
  placement = "bottom-end",
  onChange,
}: SkillsFilterDropdownMenuProps): JSX.Element => {
  const { isLessThan } = useScreenSizes({});
  const { set } = useMutableParams();

  const form = useForm<SkillsChartFilterFormValues>({
    schema: SkillsChartFilterFormSchema,
    defaultValues: { showTopSkills: "all" },
    onChange: ({ values }) => {
      if (useSearchParams) {
        set({ filters: values });
      }
      onChange?.(values);
    },
  });

  /* We do not want to show the chart filters on mobile devices until we figure out how to more
     cleanly integrate them into the mobile experience with a drawer instead of a popover. */
  if (isLessThan("md")) {
    return <></>;
  }

  return (
    <Popover
      placement={placement}
      triggers={["click"]}
      offset={{ mainAxis: 4 }}
      width={400}
      withArrow={false}
      isDisabled={isDisabled}
      content={
        <PopoverContent className="p-[20px] rounded-md overflow-y-auto" variant="white">
          <SkillsChartFilterForm form={form} isScrollable={false} />
        </PopoverContent>
      }
    >
      {({ ref, params }) => (
        <ChartFilterButton
          {...params}
          size={isLessThan("md") ? "xsmall" : "medium"}
          {...buttonProps}
          ref={ref}
          isDisabled={isDisabled}
        />
      )}
    </Popover>
  );
};

export default SkillsFilterDropdownMenu;
