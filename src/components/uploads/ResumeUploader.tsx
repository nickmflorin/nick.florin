import { MIME_TYPES } from "@mantine/dropzone";

import { Uploader, type UploaderProps } from "./Uploader";

export interface ResumeUploaderProps extends Omit<UploaderProps, "accept"> {}

export const ResumeUploader = (props: ResumeUploaderProps): JSX.Element => (
  <Uploader {...props} accept={[MIME_TYPES.pdf]} />
);
