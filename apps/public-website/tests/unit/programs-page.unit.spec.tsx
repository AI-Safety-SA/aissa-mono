import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProgramsPage from "@/app/programs/page";
import { getPrograms } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getPrograms: vi.fn(),
}));

describe("public website programs page", () => {
  beforeEach(() => {
    vi.mocked(getPrograms).mockResolvedValue([]);
  });

  it("renders the programs description", async () => {
    render(await ProgramsPage());

    expect(getPrograms).toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Programs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "We run workshops, BlueDot courses, retreats and fellowships where participants are educated about the risks from advanced AI and make contributions to research shaping the field.",
      ),
    ).toBeInTheDocument();
  });

  it("renders program cards", async () => {
    vi.mocked(getPrograms).mockResolvedValue([
      {
        description: {
          root: {
            children: [
              {
                text: "A technical program for AI safety research practice.",
                type: "text",
              },
            ],
            type: "root",
          },
        },
        id: 1,
        image: {
          alt: "Program participants",
          url: "https://media.example.com/program.jpg",
        },
        name: "AI Safety Fellowship",
        slug: "ai-safety-fellowship",
        totalParticipants: 24,
        type: "fellowship",
      },
    ]);

    render(await ProgramsPage());

    const programLink = screen.getByRole("link", {
      name: "AI Safety Fellowship",
    });
    expect(programLink).toHaveAttribute(
      "href",
      "/programs/ai-safety-fellowship",
    );
    expect(screen.getByText("24 participants")).toBeInTheDocument();
  });
});
