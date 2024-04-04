"use client";
import { useMemo, useState } from "react";

import { autoPlacement } from "@floating-ui/react";
import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { deleteCompany } from "~/actions/mutations/companies";
import { deleteSchool } from "~/actions/mutations/schools";
import { IconButton } from "~/components/buttons";
import { Tooltip } from "~/components/floating/Tooltip";
import { Text } from "~/components/typography/Text";

import { type ModelType, type Model } from "./types";

const actions: { [key in ModelType]: (id: string) => Promise<void> } = {
  company: deleteCompany,
  school: deleteSchool,
};

const TooltipMessages: { [key in ModelType]: (count: number) => string } = {
  company: count =>
    `Cannot be deleted because it is associated with ${count} other experience${
      count === 1 ? "" : "s"
    }.`,
  school: count =>
    `Cannot be deleted because it is associated with ${count} education${count === 1 ? "" : "s"}.`,
};

const getCount = <M extends ModelType>(model: Model<M>, modelType: M) => {
  if (modelType === "company") {
    return (model as Model<"company">).experiences.length;
  }
  return (model as Model<"school">).educations.length;
};

interface DeleteCompanySchoolButtonProps<M extends ModelType> {
  readonly modelType: M;
  readonly model: Model<M>;
}

export const DeleteCompanySchoolButton = <M extends ModelType>({
  modelType,
  model,
}: DeleteCompanySchoolButtonProps<M>) => {
  const [isLoading, setIsLoading] = useState(false);
  const relatedCount = useMemo(() => getCount(model, modelType), [model, modelType]);

  return (
    <Tooltip
      variant="light"
      content={<Text size="sm">{TooltipMessages[modelType](relatedCount)}</Text>}
      isDisabled={relatedCount === 0}
      inPortal
      middleware={[autoPlacement()]}
      width={220}
    >
      <IconButton.Transparent
        icon={{ name: "trash-alt" }}
        className="text-red-500 rounded-full hover:text-red-600 disabled:text-red-300"
        loadingClassName="text-gray-400"
        isLoading={isLoading}
        isDisabled={relatedCount !== 0}
        onClick={async e => {
          e.stopPropagation();
          setIsLoading(true);
          try {
            await actions[modelType](model.id);
          } catch (e) {
            logger.error(`There was an error deleting the ${modelType}:\n${e}`, {
              id: model.id,
              modelType,
            });
            toast.error(`There was an error deleting the ${modelType}.`);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </Tooltip>
  );
};
