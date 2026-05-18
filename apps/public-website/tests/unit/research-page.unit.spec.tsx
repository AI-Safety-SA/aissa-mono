import { render, screen } from "@testing-library/react";
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

  it("renders the research heading", async () => {
    render(await ResearchPage());

    expect(getResearch).toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Research" }),
    ).toBeInTheDocument();
  });

  it("renders research cards", async () => {
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

    expect(screen.getByText("AISSA Alignment Note")).toBeInTheDocument();
    expect(screen.getByText("Jane Researcher")).toBeInTheDocument();
    const openLink = screen.getByRole("link", { name: /open/i });
    expect(openLink).toHaveAttribute(
      "href",
      "https://arxiv.org/abs/2605.00001",
    );
  });
});
