import Image from "next/image";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

export interface ProjectImageProps extends ComponentProps {
  readonly src: string;
  readonly caption: string[];
  readonly alt: string;
}

export const ProjectImage = ({ src, caption, alt, ...props }: ProjectImageProps) => (
  <div {...props} className={clsx("project-image max-md:gap-[8px]", props.className)}>
    <div className="project-image-wrapper md:mx-auto">
      <Image
        height={420}
        width={760}
        layout="responsive"
        src={src}
        alt={alt}
        className="project-image-image w-full h-full max-w-full"
      />
    </div>
    <div className="flex flex-col gap-[6px]">
      {caption.map((c, index) => (
        <Text key={index} className="text-description text-sm max-md:text-xs">
          {c}
        </Text>
      ))}
    </div>
  </div>
);
