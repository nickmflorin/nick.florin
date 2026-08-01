import { useContext, useEffect, type JSX } from "react";

import { DynamicLoadingContext } from "./context";

export const DynamicLoader = (): JSX.Element => {
  const setLoading = useContext(DynamicLoadingContext);

  useEffect(() => {
    setLoading(true);
    return () => setLoading(false);
  }, [setLoading]);

  return <></>;
};
