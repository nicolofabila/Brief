/** Prefix for subpath deployment (e.g. GitHub Pages project site). Empty in local dev. */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) {
    throw new Error("withBasePath expects a path starting with /");
  }
  return `${base}${path}`;
}
