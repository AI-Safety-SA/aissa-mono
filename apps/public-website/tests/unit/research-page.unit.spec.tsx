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

  it("renders the research heading with standardized page rhythm", async () => {
    render(await ResearchPage());

    expect(getResearch).toHaveBeenCalled();
    const heading = screen.getByRole("heading", { name: "Research" });
    expect(heading).toHaveClass("text-3xl", "font-bold");
    expect(heading.closest("section")).toHaveClass(
      "border-b",
      "border-border/70",
      "py-12",
    );
  });

  it("renders research cards in the standardized content region", async () => {
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
    expect(openLink.closest("section")).toHaveClass(
      "border-b",
      "border-border/70",
      "bg-card-raised/42",
      "py-16",
    );
  });
});
