import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPublicTrackRecord } from "@/lib/api";

describe("public website API client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("TRACK_RECORD_API_BASE_URL", "https://track.example.com/");
    vi.stubEnv("TRACK_RECORD_API_TOKEN", "secret-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      }),
    );
  });

  it("sends the server-only bearer token to the track-record API", async () => {
    await fetchPublicTrackRecord("home");

    expect(fetch).toHaveBeenCalledWith(
      "https://track.example.com/api/public-track-record/home",
      {
        headers: { Authorization: "Bearer secret-token" },
        next: { revalidate: 300 },
      },
    );
  });

  it("throws on upstream errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );

    await expect(fetchPublicTrackRecord("home")).rejects.toThrow(
      "Public track-record API failed: 502",
    );
  });
});
