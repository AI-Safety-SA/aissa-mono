import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GetInvolvedPage from "@/app/get-involved/page";

describe("get involved page", () => {
  it("renders the main public calls to action", () => {
    render(<GetInvolvedPage />);

    for (const name of ["Volunteer", "Co-working", "Donate"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("heading", { name: "Follow us on Socials" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Stay connected" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Not sure how to contribute yet?" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /apply to volunteer/i }),
    ).toHaveAttribute("href", "https://tally.so/r/w4gD7b");
    expect(
      screen.getByRole("link", { name: /apply for co-working/i }),
    ).toHaveAttribute("href", "https://tally.so/r/obO5q1");
    expect(screen.getByRole("link", { name: "Donate" })).toHaveAttribute(
      "href",
      "https://www.every.org/ai-safety-cape-town?utm_campaign=donate-link#/donate",
    );
    expect(screen.getByRole("link", { name: /substack/i })).toHaveAttribute(
      "href",
      "https://aisafetysouthafrica.substack.com/",
    );
    expect(screen.getByRole("link", { name: /luma/i })).toHaveAttribute(
      "href",
      "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/ai-safety-south-africa/",
    );
    expect(screen.getByRole("link", { name: /x\.com/i })).toHaveAttribute(
      "href",
      "https://x.com/AI_Safety_SA",
    );
    for (const [name, href] of [
      ["Programs", "/programs"],
      ["Events", "/events"],
      ["Research", "/research"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });
});
