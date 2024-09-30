import dynamic from "next/dynamic";
import { useEffect } from "react";

import { flip } from "@floating-ui/react";

import { type ApiSkill } from "~/database/model";

import {
  ChartFilterButton,
  type ChartFilterButtonProps,
} from "~/components/buttons/ChartFilterButton";
import { PopoverContent } from "~/components/floating/PopoverContent";
import Tooltip from "~/components/floating/Tooltip";
import { mergeFloatingEventHandlers } from "~/components/floating/util";
import { useForm } from "~/components/forms-v2/hooks/use-form";
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
  readonly skills: ApiSkill<[]>[];
  readonly filtersHaveChanged: boolean;
  readonly onClear: () => void;
  readonly onChange: (values: SkillsChartFilterFormValues) => void;
}

export const SkillsFilterPopover = ({
  isDisabled = false,
  buttonProps,
  filtersHaveChanged,
  skills,
  filters,
  onChange,
  onClear,
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
      autoUpdate
      inPortal
      isDisabled={isDisabled}
      middleware={[flip({})]}
      content={
        <PopoverContent className="p-[20px] rounded-md overflow-y-auto">
          <SkillsChartFilterForm
            form={{ ...form, setValues }}
            isClearDisabled={!filtersHaveChanged}
            isScrollable={false}
            skills={skills}
            onClear={onClear}
          />
        </PopoverContent>
      }
    >
      {({ ref, params, isOpen }) => (
        <Tooltip content="Filters" inPortal isDisabled={isOpen} offset={{ mainAxis: 4 }}>
          {({ ref: _ref, params: _params }) => (
            <ChartFilterButton
              {...mergeFloatingEventHandlers(params, _params)}
              size={isLessThan("md") ? "xsmall" : "small"}
              {...buttonProps}
              ref={instance => {
                _ref?.(instance);
                ref(instance);
              }}
              isDisabled={isDisabled}
            />
          )}
        </Tooltip>
      )}
    </Popover>
  );
};
