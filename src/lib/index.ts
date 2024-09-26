export * from "./arrays";
export * from "./dates";

export function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
