import { isNestedDetail, type ApiDetail, type ApiNestedDetail } from "~/database/model";

import { Link } from "~/components/buttons";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Label, Description } from "~/components/typography";
import type { ResumeModelSize } from "~/features/resume/types";
import { Skills } from "~/features/skills/components/badges";

import { Details } from "./Details";

export interface DetailProps<
  D extends ApiDetail<["skills", "nestedDetails"]> | ApiNestedDetail<["skills"]>,
> extends ComponentProps {
  readonly detail: D;
  readonly index?: number;
  readonly isNested?: boolean;
  readonly size: Exclude<ResumeModelSize, "small">;
}

export const Detail = <
  D extends ApiDetail<["skills", "nestedDetails"]> | ApiNestedDetail<["skills"]>,
>({
  detail,
  index,
  size,
  isNested,
  ...props
}: DetailProps<D>): JSX.Element => (
  <div
    {...props}
    className={classNames("flex flex-col gap-[10px] max-md:gap-[8px]", props.className)}
  >
    <div className="flex flex-col gap-[4px]">
      {isNested && index !== undefined ? (
        <div className="flex flex-row gap-[8px]">
          <Label className="w-[8px] text-sm max-sm:text-xs">{`${index}.`}</Label>
          {detail.project ? (
            <Link
              element="link"
              href={`/projects/${detail.project.slug}`}
              className="text-sm max-sm:text-xs"
            >
              {detail.label}
            </Link>
          ) : (
            <Label className="text-sm max-sm:text-xs">{detail.label}</Label>
          )}
        </div>
      ) : detail.project ? (
        <Link
          element="link"
          href={`/projects/${detail.project.slug}`}
          gap="4px"
          icon={{ right: { name: "link" } }}
          className="text-sm max-sm:text-xs"
        >
          {detail.label}
        </Link>
      ) : (
        <Label className="text-sm max-sm:text-xs">{detail.label}</Label>
      )}
      {detail.description && (
        <Description
          className={classNames({
            "pl-[16px]": index !== undefined && isNested,
          })}
        >
          {detail.description}
        </Description>
      )}
    </div>
    {detail.skills.length !== 0 && (
      <Skills
        skills={detail.skills}
        className={classNames("sm:max-w-[800px]", { "pl-[16px]": index !== undefined })}
      />
    )}
    {!isNestedDetail(detail) && (
      <Details size={size} details={detail.nestedDetails} isNested={true} />
    )}
  </div>
);
