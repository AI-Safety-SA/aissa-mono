import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GetInvolvedPage from "@/app/get-involved/page";

describe("get involved page", () => {
  it("renders the main public calls to action", () => {
    render(<GetInvolvedPage />);

    for (const name of [
      "Volunteer",
      "Apply",
      "Subscribe",
      "Attend events",
      "Co-working",
      "Follow",
      "Donate",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: /apply to volunteer/i })).toHaveAttribute(
      "href",
      "https://tally.so/r/w4gD7b",
    );
  });
});
