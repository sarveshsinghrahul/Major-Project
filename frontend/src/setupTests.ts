import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Node 22+ has its own experimental `localStorage` global, which is undefined unless Node is started
// with --localstorage-file, and it hides jsdom's. Point the global back at jsdom's storage.
const jsdomStorage = (globalThis as { jsdom?: { window: Window } }).jsdom?.window.localStorage;
if (jsdomStorage) Object.defineProperty(globalThis, "localStorage", { value: jsdomStorage, configurable: true });

afterEach(() => {
  cleanup();
  localStorage.clear();
});
