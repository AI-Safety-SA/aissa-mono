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
      totalProjects: 1,
      totalResearch: 4,
    },
    events: [],
    programs: [],
    projects: [],
    research: [],
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
    expect(screen.getByText("Total Participants")).toBeInTheDocument();
  });
});
