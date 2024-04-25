import { prisma } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { convertToPlainObject } from "~/api/serialization";
import { PublicResumeDownloadMenu } from "~/components/menus/PublicResumeDropdownMenu";

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
        <div className="flex flex-row justify-end">
          <PublicResumeDownloadMenu resume={resume} />
        </div>
      )}
      <div className="flex flex-col overflow-y-auto grow w-full">
        <div className="flex flex-col min-w-[680px] max-w-[820px] max-h-full mx-auto my-0">
          {children}
        </div>
      </div>
    </div>
  );
}
