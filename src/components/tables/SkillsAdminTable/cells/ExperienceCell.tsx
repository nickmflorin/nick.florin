"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";

import { toast } from "react-toastify";
import { z } from "zod";

import type * as types from "../../types";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { Checkbox } from "~/components/input/Checkbox";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import { Label } from "~/components/typography/Label";
import { type ApiSkill } from "~/prisma/model";

interface ExperienceCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
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
        input.current.setValue(String(skill.autoExperience));
      } else {
        _setIsAuto(false);
      }
    },
    [input, skill.autoExperience],
  );

  useEffect(() => {
    setIsAuto(skill.experience === null);
  }, [skill.experience, setIsAuto]);

  return (
    <div className="flex flex-row gap-[12px] items-center justify-center">
      <div className="flex flex-row gap-[6px] items-center w-[52px]">
        <Checkbox
          checked={isAuto}
          onChange={async e => {
            // Optimistically update the state of the checkbox.
            setIsAuto(e.target.checked);
            if (!e.target.checked) {
              table.setRowLoading(skill.id, true);
              try {
                await updateSkill(skill.id, { experience: null });
              } catch (e) {
                logger.error(e);
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
        <Label size="sm">Auto</Label>
      </div>
      {/* TODO: Figure out how to use an input that forces numeric values only, and appends the
          value with "years". */}
      <ReadWriteTextInput
        className="w-[50px]"
        ref={input}
        initialValue={skill.experience ? String(skill.experience) : String(skill.autoExperience)}
        isDisabled={isAuto}
        onPersist={async ex => {
          // This check should be alleviated when we incorporate a numeric input.
          const parsed = z.coerce.number().int().safeParse(ex);
          if (parsed.success) {
            table.setRowLoading(skill.id, true);
            try {
              await updateSkill(skill.id, { experience: parseInt(ex) });
            } catch (e) {
              logger.error(e);
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
