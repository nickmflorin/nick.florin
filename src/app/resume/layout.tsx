import { prisma } from "~/prisma/client";
import { type BrandResume } from "~/prisma/model";
import { PublicResumeDownloadMenu } from "~/components/menus/PublicResumeDropdownMenu";

interface ResumeLayoutProps {
  readonly chart: React.ReactNode;
  readonly children: React.ReactNode;
}

export default async function ResumeLayout({ children, chart }: ResumeLayoutProps) {
  let resume: BrandResume | null = null;
  const resumes = await prisma.resume.findMany({
    where: { primary: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  if (resumes.length !== 0) {
    resume = resumes[0];
  }
  return (
    <div className="flex flex-row gap-[20px] min-h-full max-h-full">
      <div className="flex flex-col max-w-[900px] p-[15px] grow w-[50%] relative">{chart}</div>
      <div className="flex flex-col grow min-w-[680px] relative w-[50%]">
        {resume && (
          <div className="flex flex-row justify-end">
            <PublicResumeDownloadMenu resume={resume} />
          </div>
        )}
        <div className="flex flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
