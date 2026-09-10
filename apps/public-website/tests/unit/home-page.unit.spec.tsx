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
    team: [],
    testimonials: [],
  }),
}));

describe("public website homepage transition takeover", () => {
  it("shows the rebrand overlay with the transition graphic, copy, and CISAI links", async () => {
    render(await HomePage());

    expect(getHome).toHaveBeenCalled();

    expect(
      screen.getByAltText(
        "AI Safety South Africa transitioning to the Cape Institute for Safe AI",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/is rebranding to the/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Cape Institute for Safe AI" }),
    ).toHaveAttribute("href", "https://www.cisai.co");
    expect(
      screen.getByRole("link", { name: "apply to volunteer here" }),
    ).toHaveAttribute("href", "https://tally.so/r/w4gD7b");
    expect(
      screen.getByRole("link", { name: "apply to join here" }),
    ).toHaveAttribute("href", "https://tally.so/r/EkRKDN");

    const cta = screen.getByRole("link", {
      name: "Visit the Cape Institute for Safe AI",
    });
    expect(cta).toHaveAttribute("href", "https://www.cisai.co");
    expect(cta).toHaveAttribute("target", "_blank");
  });

  it("hides the previous full homepage content from the accessibility tree", async () => {
    render(await HomePage());

    expect(
      screen.queryByRole("heading", {
        name: "Building networks for an empowered future.",
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /get involved/i }),
    ).not.toBeInTheDocument();
  });
});
