"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";

import { toast } from "react-toastify";
import { z } from "zod";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";

import { updateSkill } from "~/actions/mutations/skills";

import { Checkbox } from "~/components/input/Checkbox";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import type * as types from "~/components/tables/types";
import { Label } from "~/components/typography/Label";

interface ExperienceCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
  readonly table: types.CellTableInstance<
    ApiSkill<["experiences", "educations", "projects", "repositories"]>
  >;
}

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
              try {
                await updateSkill(skill.id, { experience: null });
              } catch (e) {
                logger.error(
                  `There was an error updating the experience for the skill with ID '${skill.id}':\n${e}`,
                  {
                    error: e,
                    skill: skill.id,
                    experience: null,
                  },
                );
                toast.error("There was an error updating the skill.");
              } finally {
                table.setRowLoading(skill.id, false);
              }
              transition(() => {
                router.refresh();
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
            try {
              await updateSkill(skill.id, { experience: parseInt(ex) });
            } catch (e) {
              logger.error(
                `There was an error updating the experience for the skill with ID '${skill.id}':\n${e}`,
                {
                  error: e,
                  skill: skill.id,
                  experience: parseInt(ex),
                },
              );
              toast.error("There was an error updating the skill.");
            } finally {
              table.setRowLoading(skill.id, false);
            }
            transition(() => {
              router.refresh();
            });
          }
        }}
      />
    </div>
  );
};

export default ExperienceCell;
