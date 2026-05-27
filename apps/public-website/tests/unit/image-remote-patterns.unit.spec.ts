import { describe, expect, it } from "vitest";
import { buildRemoteImagePatterns } from "@/lib/image-remote-patterns";

describe("buildRemoteImagePatterns", () => {
  it("allows Cloudflare R2 public bucket hosts without relying on env", () => {
    expect(buildRemoteImagePatterns(undefined)).toEqual([
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
    ]);
  });

  it("uses only the configured public R2 host when it is available", () => {
    expect(
      buildRemoteImagePatterns("https://pub-6de89fe5fbc64794a63ec607b7cdb7ef.r2.dev/"),
    ).toEqual([
      {
        protocol: "https",
        hostname: "pub-6de89fe5fbc64794a63ec607b7cdb7ef.r2.dev",
        pathname: "/**",
      },
    ]);
  });

  it("preserves custom path prefixes in configured public R2 urls", () => {
    expect(buildRemoteImagePatterns("https://cdn.example.com/uploads/media/")).toEqual([
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/uploads/media/**",
      },
    ]);
  });
});
