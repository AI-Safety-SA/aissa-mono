import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgramDetailPage from "@/app/programs/[slug]/page";
import { PublicTrackRecordApiError } from "@/lib/api";
import { getProgram } from "@/lib/api";

const notFoundMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
);

const getProgramMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();

  return {
    ...actual,
    getProgram: getProgramMock,
  };
});

describe("public website detail pages", () => {
  beforeEach(() => {
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
    expect(screen.getAllByText("Participants").length).toBeGreaterThan(0);
    expect(screen.queryByText("Completions")).not.toBeInTheDocument();
    expect(screen.queryByText("Completed")).not.toBeInTheDocument();
    expect(screen.getByText("Cape Town 2026")).toBeInTheDocument();
    expect(screen.getByText("University Partner")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /visit website/i }),
    ).toHaveAttribute("href", "https://example.com");
  });

  it("omits unsafe program website links", async () => {
    vi.mocked(getProgram).mockResolvedValue({
      cohorts: [],
      description: "A program with an unsafe website URL.",
      gallery: [],
      id: 5,
      image: null,
      name: "Unsafe Website Program",
      partners: [],
      projects: [],
      slug: "unsafe-website-program",
      type: "course",
      websiteUrl: "javascript:alert(1)",
    });

    render(
      await ProgramDetailPage({
        params: Promise.resolve({ slug: "unsafe-website-program" }),
      }),
    );

    expect(screen.getByText("Unsafe Website Program")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /visit website/i }),
    ).not.toBeInTheDocument();
  });

  it("renders program detail text before the banner image", async () => {
    vi.mocked(getProgram).mockResolvedValue({
      cohorts: [],
      description: "A program with a separate page description.",
      gallery: [],
      id: 4,
      image: {
        alt: "Participants working during the program",
        url: "https://media.example.com/program.jpg",
      },
      name: "Banner First Program",
      partners: [],
      projects: [],
      slug: "banner-first-program",
      type: "course",
    });

    const { container } = render(
      await ProgramDetailPage({
        params: Promise.resolve({ slug: "banner-first-program" }),
      }),
    );

    const articleText = container.textContent ?? "";
    const headingOffset = articleText.indexOf("Banner First Program");
    const descriptionOffset = articleText.indexOf(
      "A program with a separate page description.",
    );
    expect(headingOffset).toBeGreaterThanOrEqual(0);
    expect(descriptionOffset).toBeGreaterThan(headingOffset);
    expect(
      screen.getByAltText("Participants working during the program"),
    ).toBeInTheDocument();
  });

  it("formats program date-only values without UTC timezone drift", async () => {
    vi.mocked(getProgram).mockResolvedValue({
      cohorts: [
        {
          id: 1,
          name: "February Cohort",
          slug: "february-cohort",
          startDate: "2026-02-01",
        },
      ],
      description: "A date-stable fellowship.",
      endDate: "2026-04-01",
      gallery: [],
      id: 3,
      image: null,
      name: "Date Stable Program",
      partners: [],
      projects: [],
      slug: "date-stable-program",
      startDate: "2026-02-01",
      type: "fellowship",
    });

    render(
      await ProgramDetailPage({
        params: Promise.resolve({ slug: "date-stable-program" }),
      }),
    );

    expect(screen.getAllByText("Feb 2026 - Apr 2026").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("February Cohort")).toBeInTheDocument();
  });
});
