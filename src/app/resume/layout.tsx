import dynamic from "next/dynamic";

import clsx from "clsx";

import { prisma } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { convertToPlainObject } from "~/api/serialization";

const PublicResumeDownloadMenu = dynamic(
  () => import("~/components/menus/PublicResumeDropdownMenu"),
);

interface ResumeLayoutProps {
  readonly children: React.ReactNode;
}

export default async function ResumeLayout({ children }: ResumeLayoutProps) {
  let resume: BrandResume | null = null;
  const resumes = await prisma.resume.findMany({
    where: { primary: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (resumes.length !== 0) {
    resume = convertToPlainObject(resumes[0]);
  }
  return (
    <div className="flex flex-col grow relative max-h-full min-h-full">
      {resume && (
        // TODO: Figure out an alternative solution for downloading/viewing resume on mobile.
        <div className="flex flex-row justify-end max-md:hidden">
          <PublicResumeDownloadMenu resume={resume} />
        </div>
      )}
      <div className="flex flex-col overflow-y-auto overflow-x-hidden grow w-full">
        <div
          className={clsx(
            "flex flex-col max-h-full my-0",
            "sm:w-full sm:max-w-full sm:mx-auto",
            "md:min-w-[680px] md:max-w-[820px]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
