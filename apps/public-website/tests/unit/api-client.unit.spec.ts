import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchPublicTrackRecord,
  getHome,
  getPrograms,
  isPublicTrackRecordNotFound,
  PublicTrackRecordApiError,
} from "@/lib/api";

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

  it("exposes typed not-found API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );

    const error = await fetchPublicTrackRecord("programs/missing").catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(PublicTrackRecordApiError);
    expect(isPublicTrackRecordNotFound(error)).toBe(true);
  });

  it("filters image-less programs from the home payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          events: [],
          programs: [
            {
              id: 1,
              image: {
                alt: "Program image",
                url: "https://media.example.com/program.jpg",
              },
              name: "Visible Program",
              slug: "visible-program",
            },
            {
              id: 2,
              image: null,
              name: "Hidden Program",
              slug: "hidden-program",
            },
          ],
          research: [],
          stats: {
            totalEvents: 0,
            totalParticipants: 0,
            totalPrograms: 2,
            totalResearch: 0,
          },
          team: [],
          testimonials: [],
        }),
      }),
    );

    const home = await getHome();

    expect(home.programs.map((program) => program.name)).toEqual([
      "Visible Program",
    ]);
  });

  it("filters image-less programs from the programs collection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([
          {
            id: 1,
            image: {
              alt: "Program image",
              url: "https://media.example.com/program.jpg",
            },
            name: "Visible Program",
            slug: "visible-program",
          },
          {
            id: 2,
            image: { alt: "Missing URL", url: null },
            name: "Hidden Program",
            slug: "hidden-program",
          },
        ]),
      }),
    );

    const programs = await getPrograms();

    expect(programs.map((program) => program.name)).toEqual([
      "Visible Program",
    ]);
  });
});
