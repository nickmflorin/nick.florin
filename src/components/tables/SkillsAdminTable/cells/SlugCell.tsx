"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateSkill } from "~/app/actions/updateSkill";
import { slugify } from "~/lib/formatters";
import { IconButton } from "~/components/buttons";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import { type ApiSkill, type Skill } from "~/prisma/model";

interface SlugCellProps {
  readonly skill: ApiSkill;
}

export const SlugCell = ({ skill }: SlugCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <div className="flex flex-row justify-between gap-[12px]">
      <ReadWriteTextInput
        ref={input}
        initialValue={skill.slug}
        onPersist={async (slug, instance) => {
          // TODO: Consider reverting the change if the request fails.
          instance.setLoading(true);
          try {
            await updateSkill(skill.id, { slug });
          } catch (e) {
            /* eslint-disable-next-line no-console -- Need to handle the error better! */
            console.error(e);
            return false;
          } finally {
            instance.setLoading(false);
          }
          // TODO: Do we need to do this?  The updated value should be in state?
          transition(() => {
            router.refresh();
          });
        }}
      />
      <IconButton.Transparent
        icon={{ name: "refresh" }}
        className="text-blue-600"
        disabledClassName="text-disabled"
        isLoading={loading}
        isDisabled={skill.slug === slugify(skill.label)}
        onClick={async () => {
          setLoading(true);
          await new Promise(resolve => setTimeout(resolve, 2000));
          let updatedSkill: Skill;
          try {
            updatedSkill = await updateSkill(skill.id, { refreshSlug: true });
          } catch (e) {
            /* eslint-disable-next-line no-console -- Need to handle the error better! */
            console.error(e);
            return false;
          } finally {
            setLoading(false);
          }
          input.current.setValue(updatedSkill.slug, { state: "reading" });
          /* Note: The reason we need to do this is because the button's disabled state depends on
             the current value of the slug in the table data. */
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default SlugCell;
