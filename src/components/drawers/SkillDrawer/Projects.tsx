import { type ApiSkill } from "~/prisma/model";
import { Link } from "~/components/buttons";
import { Label } from "~/components/typography/Label";

export const Projects = ({ projects }: { projects: ApiSkill<["projects"]>["projects"] }) => (
  <div className="flex flex-col gap-[10px]">
    <Label size="sm" fontWeight="medium">
      Projects
    </Label>
    <div className="flex flex-col gap-[12px]">
      {projects.map((project, index) => (
        <div className="flex flex-col gap-[8px]" key={index}>
          <Link
            options={{ as: "link" }}
            fontWeight="regular"
            fontSize="sm"
            href={`/projects/${project.slug}`}
          >
            {project.name}
          </Link>
        </div>
      ))}
    </div>
  </div>
);

export default Projects;
