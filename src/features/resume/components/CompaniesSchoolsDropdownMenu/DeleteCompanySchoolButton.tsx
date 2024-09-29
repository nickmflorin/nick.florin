"use client";
import { useMemo, useState } from "react";

import { autoPlacement } from "@floating-ui/react";
import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions-v2";
import { deleteCompany } from "~/actions-v2/companies/delete-company";
import { deleteSchool } from "~/actions-v2/schools/delete-school";

import { IconButton } from "~/components/buttons";
import { Tooltip } from "~/components/floating/Tooltip";
import { Text } from "~/components/typography";

import { type ModelType, type Model } from "./types";

const actions: {
  [key in ModelType]: (id: string) => Promise<MutationActionResponse<{ message: string }>>;
} = {
  company: async id => await deleteCompany(id),
  school: async id => await deleteSchool(id),
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
      content={<Text fontSize="sm">{TooltipMessages[modelType](relatedCount)}</Text>}
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
        onClick={async (evt: React.MouseEvent<HTMLButtonElement>) => {
          evt.stopPropagation();
          setIsLoading(true);
          let response: MutationActionResponse<{ message: string }> | null = null;
          try {
            response = await actions[modelType](model.id);
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error deleting the ${modelType} with ID '${model.id}'.`,
              { model, modelType },
            );
            setIsLoading(false);
            return toast.error(`There was an error deleting the ${modelType}.`);
          }
          const { error } = response;
          if (error) {
            logger.error(
              error,
              `There was an error deleting the ${modelType} with ID '${model.id}'.`,
              {
                model,
                modelType,
              },
            );
            setIsLoading(false);
            return toast.error(`There was an error deleting the ${modelType}.`);
          }
          setIsLoading(false);
        }}
      />
    </Tooltip>
  );
};
