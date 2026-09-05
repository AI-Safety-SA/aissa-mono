import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/footer";

describe("Footer", () => {
  it("separates information and socials links", () => {
    render(<Footer />);

    const policyNav = screen.getByRole("navigation", { name: "Information" });
    expect(
      within(policyNav).getByRole("link", { name: "Feedback" }),
    ).toHaveAttribute("href", "https://tally.so/r/2EEV5A");

    const socialsNav = screen.getByRole("navigation", { name: "Socials" });

    expect(
      within(socialsNav).getByRole("link", { name: "Substack" }),
    ).toHaveAttribute("href", "https://aisafetysouthafrica.substack.com/");
    expect(
      within(socialsNav).getByRole("link", { name: "Luma" }),
    ).toHaveAttribute("href", "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe");
    expect(
      within(socialsNav).getByRole("link", { name: "LinkedIn" }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/ai-safety-south-africa/",
    );
    expect(within(socialsNav).getByRole("link", { name: "X" })).toHaveAttribute(
      "href",
      "https://x.com/AI_Safety_SA",
    );
  });
});
