import React, { type ReactNode } from "react";

/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
// import "@fortawesome/fontawesome-svg-core/styles.css";

import { SWRConfig } from "./SWRConfig";

export interface ClientConfigProps {
  readonly children: ReactNode;
}

export const ClientConfig = (props: ClientConfigProps) => <SWRConfig>{props.children}</SWRConfig>;

export default ClientConfig;
