import { Link } from "~/components/buttons";
import { Text } from "~/components/typography/Text";

import { Project, type ProjectProps } from "../Project";
import { ProjectImage } from "../ProjectImage";

export interface WebsiteProps extends Omit<ProjectProps, "title" | "description" | "children"> {}

export const Website = (props: WebsiteProps): JSX.Element => (
  <Project
    title="nick.florin"
    description={[
      <Text key="0" className="text-body-light">
        <Text span>
          A CMS-powered, interactive and dynamic personal portfolio/website written using{" "}
        </Text>
        <Link options={{ as: "a" }} href="https://nextjs.org/">
          NextJS
        </Link>
        .
      </Text>,
    ]}
    {...props}
  >
    <ProjectImage
      src="/projects/website/editing-experiences.png"
      alt="Editing Experience"
      caption={["Modifying, creating, deleting and updating experiences in the admin-only CMS."]}
    />
    <ProjectImage
      src="/projects/website/editing-skills.png"
      alt="Editing Skills"
      caption={["Modifying, creating, deleting and updating skills in the admin-only CMS."]}
    />
  </Project>
);

export default Website;
