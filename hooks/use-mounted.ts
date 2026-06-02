import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const mountedSnapshot = () => true;
const serverSnapshot = () => false;

export function useMounted() {
  return useSyncExternalStore(subscribe, mountedSnapshot, serverSnapshot);
}
