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
    programs: [],
    research: [],
    team: [
      {
        bio: "Supports public AISSA programs.",
        fullName: "Team Member",
        headshot: null,
        id: 2,
        organisation: "AISSA",
        personTag: "Programme Lead",
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
    expect(screen.getByText("AI Safety South Africa")).toBeInTheDocument();
    expect(screen.getByText("Total Participants")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
    expect(screen.getByText(/concrete path into AI safety/i)).toBeInTheDocument();
    expect(screen.getByText("Team Member")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: /get involved/i })
        .every((link) => link.getAttribute("href") === "/get-involved"),
    ).toBe(true);
  });
});
