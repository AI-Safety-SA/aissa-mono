import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";

describe("Footer", () => {
  it("separates explore, information, and external profile links", () => {
    render(<Footer />);

    const siteNav = screen.getByRole("navigation", { name: "Explore" });
    expect(
      within(siteNav).getByRole("link", { name: "Programs" }),
    ).toHaveAttribute("href", "/programs");
    expect(
      within(siteNav).getByRole("link", { name: "Events" }),
    ).toHaveAttribute("href", "/events");
    expect(
      within(siteNav).getByRole("link", { name: "Research" }),
    ).toHaveAttribute("href", "/research");
    expect(
      within(siteNav).getByRole("link", { name: "Get Involved" }),
    ).toHaveAttribute("href", "/get-involved");

    const policyNav = screen.getByRole("navigation", { name: "Information" });
    expect(
      within(policyNav).getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy-policy");
    expect(
      within(policyNav).getByRole("link", { name: "Code of Conduct" }),
    ).toHaveAttribute("href", "/code-of-conduct");
    expect(
      within(policyNav).getByRole("link", { name: "Feedback" }),
    ).toHaveAttribute("href", "https://tally.so/r/2EEV5A");

    expect(screen.getByRole("link", { name: "Substack" })).toHaveAttribute(
      "href",
      "https://aisafetysouthafrica.substack.com/",
    );
    expect(screen.getByRole("link", { name: "Luma" })).toHaveAttribute(
      "href",
      "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe",
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/ai-safety-south-africa/",
    );
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute(
      "href",
      "https://x.com/AI_Safety_SA",
    );
  });
});
