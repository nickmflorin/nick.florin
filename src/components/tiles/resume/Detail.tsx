import clsx from "clsx";

import type { ResumeModelSize } from "./types";

import { isNestedDetail, type ApiDetail, type NestedApiDetail } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { Link } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

import { Details } from "./Details";
import { ResumeTileDescription } from "./ResumeTileDescription";

export interface DetailProps<
  D extends ApiDetail<["skills", "nestedDetails"]> | NestedApiDetail<["skills"]>,
> extends ComponentProps {
  readonly detail: D;
  readonly index?: number;
  readonly isNested?: boolean;
  readonly size: Exclude<ResumeModelSize, "small">;
}

export const Detail = <
  D extends ApiDetail<["skills", "nestedDetails"]> | NestedApiDetail<["skills"]>,
>({
  detail,
  index,
  size,
  isNested,
  ...props
}: DetailProps<D>): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[10px] max-md:gap-[8px]", props.className)}>
    <div className="flex flex-col gap-[4px]">
      {isNested && index !== undefined ? (
        <div className="flex flex-row gap-[8px]">
          <Label
            className={clsx("w-[8px]", {
              "text-sm": isNested,
              "text-smplus max-sm:text-sm": !isNested,
            })}
          >
            {`${index}.`}
          </Label>
          {detail.project ? (
            <Link
              options={{ as: "link" }}
              href={`/projects/${detail.project.slug}`}
              className={clsx({
                "text-sm": isNested,
                "text-smplus max-sm:text-sm": !isNested,
              })}
            >
              {detail.label}
            </Link>
          ) : (
            <Label
              className={clsx({
                "text-sm": isNested,
                "text-smplus max-sm:text-sm": !isNested,
              })}
            >
              {detail.label}
            </Label>
          )}
        </div>
      ) : detail.project ? (
        <div className="flex flex-row items-center gap-[4px]">
          <Link
            options={{ as: "link" }}
            href={`/projects/${detail.project.slug}`}
            gap="4px"
            flex
            icon={{ right: { name: "link" } }}
            className={clsx({
              "text-sm": isNested,
              "text-smplus max-sm:text-sm": !isNested,
            })}
          >
            {detail.label}
          </Link>
        </div>
      ) : (
        <Label
          className={clsx({
            "text-sm": isNested,
            "text-smplus max-sm:text-sm": !isNested,
          })}
        >
          {detail.label}
        </Label>
      )}
      {detail.description && (
        <ResumeTileDescription
          size={size}
          className={clsx({
            "pl-[16px]": index !== undefined && isNested,
          })}
        >
          {detail.description}
        </ResumeTileDescription>
      )}
    </div>
    {detail.skills.length !== 0 && (
      <Skills
        skills={detail.skills}
        className={clsx("sm:max-w-[800px]", { "pl-[16px]": index !== undefined })}
      />
    )}
    {!isNestedDetail(detail) && (
      <Details size={size} details={detail.nestedDetails} isNested={true} />
    )}
  </div>
);
