import clsx from "clsx";

import { isNestedDetail, type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { Link } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";
import { type TypographySize } from "~/components/typography";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";

import { Details } from "./Details";

export interface DetailProps<
  D extends ApiDetail<{ nestedDetails: true; skills: true }> | NestedApiDetail<{ skills: true }>,
> extends ComponentProps {
  readonly detail: D;
  readonly index?: number;
  readonly textSize?: TypographySize;
}

export const Detail = <
  D extends ApiDetail<{ nestedDetails: true; skills: true }> | NestedApiDetail<{ skills: true }>,
>({
  detail,
  index,
  textSize = "md",
  ...props
}: DetailProps<D>): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[10px]", props.className)}>
    <div className="flex flex-col gap-[2px]">
      {index !== undefined ? (
        <div className="flex flex-row gap-[8px]">
          <Label size={textSize} className="w-[8px]">
            {`${index}.`}
          </Label>
          {detail.project ? (
            <Link
              fontSize={textSize}
              options={{ as: "link" }}
              href={`/projects/${detail.project.slug}`}
            >
              {detail.label}
            </Link>
          ) : (
            <Label size={textSize}>{detail.label}</Label>
          )}
        </div>
      ) : detail.project ? (
        <div className="flex flex-row items-center gap-[4px]">
          <Link
            fontSize={textSize}
            options={{ as: "link" }}
            href={`/projects/${detail.project.slug}`}
            gap="4px"
            flex
            icon={{ right: { name: "link" } }}
          >
            {detail.label}
          </Link>
        </div>
      ) : (
        <Label size={textSize}>{detail.label}</Label>
      )}
      {detail.description && (
        <Description
          fontSize="smplus"
          className={clsx("text-gray-600", { "pl-[16px]": index !== undefined })}
        >
          {detail.description}
        </Description>
      )}
    </div>
    {detail.skills.length !== 0 && <Skills skills={detail.skills} className="max-w-[800px]" />}
    {!isNestedDetail(detail) && <Details details={detail.nestedDetails} isNested={true} />}
  </div>
);
