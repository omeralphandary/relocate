// Global test setup — runs before every test file
import { vi } from "vitest";

// Silence console.error/log noise in test output unless a test explicitly asserts on it
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "log").mockImplementation(() => {});
