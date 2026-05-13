import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";
import { getHome } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getHome: vi.fn().mockResolvedValue({
    stats: {
      totalEvents: 2,
      totalParticipants: 10,
      totalPrograms: 3,
      totalResearch: 4,
    },
    events: [],
    programs: [
      {
        description:
          "A fellowship focused on cooperative AI research with a longer summary that should render on the featured card.",
        id: 1,
        image: null,
        name: "Cooperative AI Research Fellowship",
        slug: "cooperative-ai-research-fellowship",
        totalCompletions: 12,
        totalParticipants: 12,
        type: "fellowship",
      },
      {
        description: "blank description",
        id: 2,
        image: null,
        name: "AISF Economics - June 2025",
        slug: "aisf-economics-june-2025",
        totalCompletions: 3,
        totalParticipants: 10,
        type: "course",
      },
    ],
    research: [],
    team: [
      {
        bio: "Supports public AISSA programs by coordinating a long-running set of community, research, and training activities across South Africa, with enough context to require a compact preview before the full biography is opened.",
        fullName: "Team Member",
        headshot: null,
        id: 2,
        organisation: "AISSA",
        personTag: "Programme Lead",
        websiteUrl: "https://example.org/team-member",
      },
    ],
    testimonials: [
      {
        attributionName: "AISSA participant",
        attributionTitle: "Fellow",
        contextKind: "program",
        id: 1,
        quote: "This helped me find a concrete path into AI safety.",
      },
    ],
  }),
}));

describe("public website homepage", () => {
  it("omits grants, funding, featured community, and people highlights", async () => {
    render(await HomePage());

    expect(getHome).toHaveBeenCalled();
    expect(screen.queryByText(/grants/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/funding/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/featured community/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/people building/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/engagement/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/impact count/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/capacity building organisation focused/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("AISSA partners")).toBeInTheDocument();
    expect(screen.getByAltText("Open Philanthropy Logo")).toBeInTheDocument();
    expect(screen.getByText("Total Participants")).toBeInTheDocument();
    expect(screen.getByText("Programs Offered")).toBeInTheDocument();
    expect(screen.queryByText("Programs Completed")).not.toBeInTheDocument();
    expect(screen.queryByText("Testimonials")).not.toBeInTheDocument();
    expect(screen.queryByText(/completions/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/concrete path into AI safety/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("blank description")).not.toBeInTheDocument();
    expect(
      screen.getByText(/longer summary that should render/i),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Cooperative AI Research Fellowship logo"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /visit website/i }),
    ).toHaveAttribute("href", "https://www.cai-research-fellowship.com/");
    expect(screen.getByText("Team Member")).toBeInTheDocument();
    expect(screen.getByText("Read more")).toBeInTheDocument();
    expect(
      screen.getAllByText(/Supports public AISSA programs/i),
    ).toHaveLength(2);
    expect(
      screen.getByText("Read more").closest("summary"),
    ).not.toHaveAccessibleName(/Supports public AISSA programs/i);
    expect(
      screen.getByRole("link", { name: "Open Team Member's website" }),
    ).toHaveAttribute("href", "https://example.org/team-member");
    expect(
      screen
        .getAllByRole("link", { name: /get involved/i })
        .every((link) => link.getAttribute("href") === "/get-involved"),
    ).toBe(true);
  });

  it("does not apply CAIRF branding to a non-CAIRF featured program", async () => {
    vi.mocked(getHome).mockResolvedValueOnce({
      stats: {
        totalEvents: 0,
        totalParticipants: 0,
        totalPrograms: 1,
        totalResearch: 0,
      },
      events: [],
      programs: [
        {
          description: "A different featured program.",
          id: 3,
          image: null,
          name: "AISF Economics",
          slug: "aisf-economics",
          type: "course",
          websiteUrl: "https://example.org/aisf",
        },
      ],
      research: [],
      team: [],
      testimonials: [],
    });

    render(await HomePage());

    expect(
      screen.queryByAltText("Cooperative AI Research Fellowship logo"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /visit website/i }),
    ).toHaveAttribute("href", "https://example.org/aisf");
  });

  it("omits unsafe team website links", async () => {
    vi.mocked(getHome).mockResolvedValueOnce({
      stats: {
        totalEvents: 0,
        totalParticipants: 0,
        totalPrograms: 0,
        totalResearch: 0,
      },
      events: [],
      programs: [],
      research: [],
      team: [
        {
          bio: "Short bio",
          fullName: "Unsafe Link Member",
          headshot: null,
          id: 4,
          organisation: "AISSA",
          personTag: "Researcher",
          websiteUrl: "javascript:alert(1)",
        },
      ],
      testimonials: [],
    });

    render(await HomePage());

    expect(screen.getByText("Unsafe Link Member")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /unsafe link member/i }),
    ).not.toBeInTheDocument();
  });
});
