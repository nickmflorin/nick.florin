"use client";
import { MantineProvider as RootMantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import "~/styles/globals/index.scss";

export const MantineProvider = ({ children }: { children: React.ReactNode }) => (
  <RootMantineProvider>{children}</RootMantineProvider>
);
