import { Loading } from "~/components/loading/Loading";
import { Module } from "~/components/structural/Module";

const LoadingPage = () => (
  <>
    <Module.Header className="!pr-[0px]">Skills Overview</Module.Header>
    <Module.Content className="xl:overflow-y-auto xl:pr-[16px]">
      <Loading isLoading={true} />
    </Module.Content>
  </>
);

export default LoadingPage;
