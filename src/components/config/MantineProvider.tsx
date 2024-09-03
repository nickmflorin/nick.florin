import { MantineProvider as RootMantineProvider } from "@mantine/core";

function MantineProvider({ children }: { children: React.ReactNode }) {
  return <RootMantineProvider>{children}</RootMantineProvider>;
}

export default MantineProvider;
