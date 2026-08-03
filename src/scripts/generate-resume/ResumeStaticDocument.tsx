import { type ReactNode } from 'react';

import { StylesheetUrl } from './config';

export interface ResumeStaticDocumentProps {
  readonly children: ReactNode;
  readonly title: string;
}

/**
 * The HTML document shell that the statically emitted resume pages are wrapped in.
 *
 * It mirrors the document root layout the app renders, with one difference: the stylesheet is
 * referenced as a relative sibling file rather than injected by the bundler. That is what allows
 * an emitted page to render correctly when opened straight off disk, which is how both the PDF
 * converter and the single-file artifact consume it.
 */
export const ResumeStaticDocument = ({ children, title }: ResumeStaticDocumentProps) => (
  <html lang='en'>
    <head>
      <meta charSet='utf-8' />
      <meta content='width=device-width, initial-scale=1.0' name='viewport' />
      <title>{title}</title>
      <link href={StylesheetUrl} rel='stylesheet' />
    </head>
    <body>{children}</body>
  </html>
);
