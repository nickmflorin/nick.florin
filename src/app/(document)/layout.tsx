import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import '~/styles/document/index.scss';

export const metadata: Metadata = {
  title: 'Nick Florin - Resume',
};

interface DocumentLayoutProps {
  readonly children: ReactNode;
}

/**
 * The root layout for the print-form document route group.
 *
 * This layout is intentionally bare: it renders no site chrome, providers, analytics or global
 * stylesheets so that the document routes are styled exclusively by the document stylesheet it
 * imports. Print fidelity of the generated resume depends on the site's styles never reaching the
 * document markup, and vice versa.
 */
const DocumentLayout = ({ children }: DocumentLayoutProps) => (
  <html lang='en'>
    <body>{children}</body>
  </html>
);

export default DocumentLayout;
