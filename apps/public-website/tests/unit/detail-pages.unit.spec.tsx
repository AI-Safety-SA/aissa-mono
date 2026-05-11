import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("renders richer program detail data", async () => {
    vi.mocked(getProgram).mockResolvedValue({
      applicationCount: 120,
      cohorts: [
        {
          acceptedCount: 24,
          completionCount: 22,
          id: 1,
          name: "Cape Town 2026",
          slug: "cape-town-2026",
          startDate: "2026-02-01T00:00:00.000Z",
        },
      ],
      description: "A selective technical fellowship.",
      endDate: "2026-04-01T00:00:00.000Z",
      gallery: [],
      id: 1,
      image: null,
      name: "AI Safety Fellowship",
      partners: [{ id: 1, name: "University Partner", website: null }],
      projects: [
        { id: 1, title: "Alignment Research Sprint", type: "program_project" },
      ],
      slug: "ai-safety-fellowship",
      startDate: "2026-02-01T00:00:00.000Z",
      totalCompletions: 22,
      totalParticipants: 24,
      type: "fellowship",
      websiteUrl: "https://example.com",
    });

    render(
      await ProgramDetailPage({
        params: Promise.resolve({ slug: "ai-safety-fellowship" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "AI Safety Fellowship" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("24").length).toBeGreaterThan(0);
    expect(screen.getByText("Cape Town 2026")).toBeInTheDocument();
    expect(screen.getByText("University Partner")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /visit website/i }),
    ).toHaveAttribute("href", "https://example.com");
  });

  it("renders richer event detail data", async () => {
    vi.mocked(getEvent).mockResolvedValue({
      attendanceCount: 80,
      description:
        "A technical talk for the South African AI safety community.",
      eventDate: "2026-03-15T00:00:00.000Z",
      gallery: [],
      hosts: [
        {
          bio: "Runs community events.",
          fullName: "Tegan Host",
          headshot: null,
          id: 2,
          organisation: "AISSA",
          personTag: "Host",
        },
      ],
      id: 1,
      image: null,
      location: "Cape Town",
      name: "Interpretability Workshop",
      organiser: {
        bio: "Organises AISSA events.",
        fullName: "Alex Organiser",
        headshot: null,
        id: 1,
        organisation: "AISSA",
        personTag: "Organiser",
      },
      slug: "interpretability-workshop",
      type: "workshop",
    });

    render(
      await EventDetailPage({
        params: Promise.resolve({ slug: "interpretability-workshop" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Interpretability Workshop" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Cape Town").length).toBeGreaterThan(0);
    expect(screen.getAllByText("80").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Alex Organiser").length).toBeGreaterThan(0);
    expect(screen.getByText("Tegan Host")).toBeInTheDocument();
  });

  it("formats event date-only values without UTC timezone drift", async () => {
    vi.mocked(getEvent).mockResolvedValue({
      eventDate: "2026-05-08",
      gallery: [],
      hosts: [],
      id: 2,
      image: null,
      name: "Date Stable Event",
      organiser: null,
      slug: "date-stable-event",
      type: "workshop",
    });

    render(
      await EventDetailPage({
        params: Promise.resolve({ slug: "date-stable-event" }),
      }),
    );

    expect(screen.getAllByText("May 8, 2026").length).toBeGreaterThan(0);
  });
});
