export const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8000/api/v1";

const mockPrefixesEnv = process.env.MOCK_PATH_PREFIXES;

export const MOCK_PATH_PREFIXES: string[] = mockPrefixesEnv !== undefined
  ? mockPrefixesEnv.split(",").map((p) => p.trim()).filter(Boolean)
  : ["/inventory/items", "/inventory/lookups", "/auth", "/navigation", "/access", "/companies"];

// Retain USE_MOCK for general/backwards compatibility
export const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true";

export function shouldMockPath(pathname: string): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return true;
  }
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  // Item categories ALWAYS routes to the real backend
  if (cleanPath.startsWith("/inventory/item-categories")) {
    return false;
  }
  return true;
}
