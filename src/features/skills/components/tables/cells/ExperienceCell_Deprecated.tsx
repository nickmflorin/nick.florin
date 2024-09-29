"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";

import { toast } from "react-toastify";
import { z } from "zod";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/skills/update-skill";

import { Checkbox } from "~/components/input/Checkbox";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import type * as types from "~/components/tables/types";
import { Label } from "~/components/typography";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface ExperienceCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

/**
 * @deprecated
 * Leaving this around for now, but it is currently not being used.
 */
export const ExperienceCell = ({ skill, table }: ExperienceCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const [isAuto, _setIsAuto] = useState(skill.experience === null);

  const router = useRouter();
  const [_, transition] = useTransition();

  const setIsAuto = useCallback(
    (v: boolean) => {
      if (v === true) {
        _setIsAuto(true);
        input.current.setValue(String(skill.calculatedExperience));
      } else {
        _setIsAuto(false);
      }
    },
    [input, skill.calculatedExperience],
  );

  useEffect(() => {
    setIsAuto(skill.experience === null);
  }, [skill.experience, setIsAuto]);

  return (
    <div className="flex flex-row gap-[12px] items-center justify-center">
      <div className="flex flex-row gap-[6px] items-center w-[52px]">
        <Checkbox
          value={isAuto}
          onChange={async e => {
            // Optimistically update the state of the checkbox.
            setIsAuto(e.target.checked);
            if (!e.target.checked) {
              table.setRowLoading(skill.id, true);
              let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
              try {
                response = await updateSkill(skill.id, { experience: null });
              } catch (e) {
                logger.errorUnsafe(
                  e,
                  `There was an error updating the experience for the skill with ID '${skill.id}'.`,
                  { skill: skill.id, experience: null },
                );
                table.setRowLoading(skill.id, false);
                return toast.error("There was an error updating the skill.");
              }
              const { error } = response;
              if (error) {
                logger.error(
                  error,
                  `There was an error updating the experience for the skill with ID '${skill.id}'.`,
                  { skill: skill.id, experience: null },
                );
                table.setRowLoading(skill.id, false);
                return toast.error("There was an error updating the skill.");
              }
              transition(() => {
                router.refresh();
                table.setRowLoading(skill.id, false);
              });
            }
          }}
        />
        <Label fontSize="sm">Auto</Label>
      </div>
      {/* TODO: Figure out how to use an input that forces numeric values only, and appends the
          value with "years". */}
      <ReadWriteTextInput
        className="w-[50px]"
        ref={input}
        initialValue={String(skill.calculatedExperience)}
        isDisabled={isAuto}
        onPersist={async ex => {
          // This check should be alleviated when we incorporate a numeric input.
          const parsed = z.coerce.number().int().safeParse(ex);
          if (parsed.success) {
            table.setRowLoading(skill.id, true);
            let response: Awaited<ReturnType<typeof updateSkill>> | null = null;
            try {
              response = await updateSkill(skill.id, { experience: parseInt(ex) });
            } catch (e) {
              logger.errorUnsafe(
                e,
                `There was an error updating the experience for the skill with ID '${skill.id}'.`,
                { skill: skill.id, experience: parseInt(ex) },
              );
              table.setRowLoading(skill.id, false);
              toast.error("There was an error updating the skill.");
              return;
            }
            const { error } = response;
            if (error) {
              logger.error(
                error,
                `There was an error updating the experience for the skill with ID '${skill.id}'.`,
                { skill: skill.id, experience: parseInt(ex) },
              );
              table.setRowLoading(skill.id, false);
              toast.error("There was an error updating the skill.");
              return;
            }
            transition(() => {
              router.refresh();
              table.setRowLoading(skill.id, false);
            });
          }
        }}
      />
    </div>
  );
};

export default ExperienceCell;
