"use client";
import { useState, useEffect } from "react";

import { z } from "zod";

import { useQueryParams } from "~/hooks";
import { RadioGroup } from "~/components/input/RadioGroup";

type TopSkill = "5" | "8" | "12" | "all";

const topSkillSchema = z.enum(["5", "8", "12", "all"]);

type TopSkillDatum = { value: TopSkill; label: string };

const TOP_SKILLS: TopSkillDatum[] = [
  { value: "5", label: "Top 5" },
  { value: "8", label: "Top 8" },
  { value: "12", label: "Top 12" },
  { value: "all", label: "All" },
];

export const TopSkillsRadioGroup = () => {
  const [value, setValue] = useState<TopSkill>("8");
  const { updateParams, params } = useQueryParams();

  useEffect(() => {
    const parsed = topSkillSchema.safeParse(params.get("topSkills"));
    if (parsed.success) {
      setValue(parsed.data);
    }
  }, [params]);

  return (
    <RadioGroup
      value={value}
      data={TOP_SKILLS}
      onChange={v => {
        updateParams({ topSkills: v }, { push: true });
        setValue(v);
      }}
    />
  );
};
