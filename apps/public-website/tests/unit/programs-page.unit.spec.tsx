import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProgramsPage from "@/app/programs/page";
import { getPrograms } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getPrograms: vi.fn().mockResolvedValue([]),
}));

describe("public website programs page", () => {
  it("renders the programs description", async () => {
    render(await ProgramsPage());

    expect(getPrograms).toHaveBeenCalled();
    expect(
      screen.getByText(
        "We run workshops, BlueDot courses, retreats and fellowships where participants are educated about the risks from advanced AI and make contributions to research shaping the field.",
      ),
    ).toBeInTheDocument();
  });
});
