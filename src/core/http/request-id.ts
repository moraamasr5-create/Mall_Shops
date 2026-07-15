import { AsyncLocalStorage } from "node:async_hooks";

export type RequestIdStore = {
  requestId: string;
};

const storage = new AsyncLocalStorage<RequestIdStore>();

export function getRequestId(): string {
  return storage.getStore()?.requestId ?? crypto.randomUUID();
}

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}
