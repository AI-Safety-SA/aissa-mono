import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResearchPage from "@/app/research/page";
import { getResearch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getResearch: vi.fn(),
}));

describe("public website research page", () => {
  beforeEach(() => {
    vi.mocked(getResearch).mockResolvedValue([]);
  });

  it("renders the research heading with the fellowship posters link", async () => {
    render(await ResearchPage());

    expect(getResearch).toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Research" }),
    ).toBeInTheDocument();

    const postersLink = screen.getByRole("link", {
      name: "here",
    });
    expect(postersLink).toHaveAttribute(
      "href",
      "https://www.cai-research-fellowship.com/posters/",
    );
    expect(postersLink).toHaveAttribute("target", "_blank");
    expect(postersLink).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByText("No research to display yet.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders research in a table", async () => {
    vi.mocked(getResearch).mockResolvedValue([
      {
        acceptedVenue: "AISSA Research Forum",
        arxivLink: "https://arxiv.org/abs/2605.00001",
        authors: [{ authorName: "Jane Researcher" }],
        id: 21,
        slug: "aissa-alignment-note",
        status: "published",
        title: "AISSA Alignment Note",
        venueType: "workshop",
      },
    ]);

    render(await ResearchPage());

    const table = screen.getByRole("table");
    expect(within(table).getByText("AISSA Alignment Note")).toBeInTheDocument();
    expect(within(table).getByText("Published")).toBeInTheDocument();
    expect(within(table).getByText("Jane Researcher")).toBeInTheDocument();
    expect(within(table).getByText("AISSA Research Forum")).toBeInTheDocument();

    const openLink = within(table).getByRole("link", { name: /open/i });
    expect(openLink).toHaveAttribute(
      "href",
      "https://arxiv.org/abs/2605.00001",
    );
    expect(openLink).toHaveAttribute("target", "_blank");
    expect(openLink).toHaveAttribute("rel", "noreferrer");
  });
});
