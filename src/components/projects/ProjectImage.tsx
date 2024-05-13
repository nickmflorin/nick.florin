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
  <div
    {...props}
    className={clsx("flex flex-col gap-[12px] max-md:gap-[8px] w-full", props.className)}
  >
    <Image
      height={420}
      width={760}
      layout="responsive"
      src={src}
      alt={alt}
      className="md:mx-auto max-w-[100%]"
    />
    <div className="flex flex-col gap-[6px]">
      {caption.map((c, index) => (
        <Text key={index} className="text-description text-sm max-md:text-xs">
          {c}
        </Text>
      ))}
    </div>
  </div>
);
