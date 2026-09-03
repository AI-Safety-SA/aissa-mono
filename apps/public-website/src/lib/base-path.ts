/**
 * next/image and plain <img> tags don't prepend Next's `basePath` to a
 * literal `src` string when `images.unoptimized` is set (required for a
 * static export with no image-optimization server), so local asset paths
 * need it applied manually.
 */
export function withBasePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${basePath}${path}`;
}
