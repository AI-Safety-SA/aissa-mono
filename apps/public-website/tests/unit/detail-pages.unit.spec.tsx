import { beforeEach, describe, expect, it, vi } from "vitest";
import EventDetailPage from "@/app/events/[slug]/page";
import ProgramDetailPage from "@/app/programs/[slug]/page";
import { PublicTrackRecordApiError } from "@/lib/api";
import { getEvent, getProgram } from "@/lib/api";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

const getEventMock = vi.hoisted(() => vi.fn());
const getProgramMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();

  return {
    ...actual,
    getEvent: getEventMock,
    getProgram: getProgramMock,
  };
});

describe("public website detail pages", () => {
  beforeEach(() => {
    vi.mocked(getEvent).mockReset();
    vi.mocked(getProgram).mockReset();
    notFoundMock.mockClear();
  });

  it("returns notFound for missing programs", async () => {
    vi.mocked(getProgram).mockRejectedValue(
      new PublicTrackRecordApiError("missing", 404),
    );

    await expect(
      ProgramDetailPage({ params: Promise.resolve({ slug: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("propagates non-404 program API failures", async () => {
    vi.mocked(getProgram).mockRejectedValue(
      new PublicTrackRecordApiError("bad gateway", 502),
    );

    await expect(
      ProgramDetailPage({ params: Promise.resolve({ slug: "offline" }) }),
    ).rejects.toThrow("bad gateway");

    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("returns notFound for missing events", async () => {
    vi.mocked(getEvent).mockRejectedValue(
      new PublicTrackRecordApiError("missing", 404),
    );

    await expect(
      EventDetailPage({ params: Promise.resolve({ slug: "missing" }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("propagates non-404 event API failures", async () => {
    vi.mocked(getEvent).mockRejectedValue(
      new PublicTrackRecordApiError("bad gateway", 502),
    );

    await expect(
      EventDetailPage({ params: Promise.resolve({ slug: "offline" }) }),
    ).rejects.toThrow("bad gateway");

    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
