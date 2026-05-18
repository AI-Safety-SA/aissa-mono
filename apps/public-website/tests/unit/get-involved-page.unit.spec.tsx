import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GetInvolvedPage from "@/app/get-involved/page";

describe("get involved page", () => {
  it("renders the main public calls to action", () => {
    render(<GetInvolvedPage />);

    const heading = screen.getByRole("heading", {
      name: "Help build AI safety capacity in South Africa.",
    });
    expect(heading.closest("section")).toHaveClass(
      "border-b",
      "border-border/70",
      "py-16",
    );
    expect(
      screen.getByAltText(
        "AISSA community members attending an AI safety event",
      ),
    ).toBeInTheDocument();
    const substackEmbed = screen.getByTitle("Subscribe to AISSA on Substack");
    expect(substackEmbed).toHaveAttribute(
      "src",
      "https://aisafetysouthafrica.substack.com/embed?transparent=1&light=0",
    );
    expect(substackEmbed).toHaveClass("h-[17rem]", "w-full", "border-0");
    expect(substackEmbed.closest(".rounded-lg")).toHaveClass(
      "mt-8",
      "max-w-xl",
      "bg-card/92",
      "shadow-card",
    );

    for (const name of ["Volunteer", "Co-work with us", "Donate"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(
      screen.getByRole("heading", { name: "Volunteer" }).closest("section"),
    ).toHaveClass("border-y", "border-border/70", "bg-card-raised/60");
    expect(
      screen.getByRole("heading", {
        name: "Keep up to date with us on socials",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Stay connected" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Not sure how to contribute yet?" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("heading", { name: "Not sure how to contribute yet?" })
        .closest("section"),
    ).toHaveClass("border-b", "border-border/70", "py-16");
    const socialResources = screen.getByRole("list", {
      name: "AISSA social resources",
    });
    expect(within(socialResources).getAllByRole("listitem")).toHaveLength(4);
    expect(
      screen.getByAltText(
        "Participants at the Stellenbosch AI safety workshop",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /apply to volunteer/i }),
    ).toHaveAttribute("href", "https://tally.so/r/w4gD7b");
    expect(
      screen.getByRole("link", { name: /apply to volunteer/i }),
    ).toHaveAttribute("target", "_blank");
    expect(
      screen.getByRole("link", { name: /apply to volunteer/i }),
    ).toHaveAttribute("rel", "noreferrer");
    expect(
      screen
        .getByRole("heading", { name: "Volunteer" })
        .closest("[data-slot='card']"),
    ).toHaveClass(
      "bg-card/92",
      "shadow-card",
      "group-hover:border-primary/35",
      "group-hover:shadow-card-hover",
    );
    expect(
      screen.getByRole("link", { name: /apply for co-working/i }),
    ).toHaveAttribute("href", "https://tally.so/r/obO5q1");
    expect(screen.getByRole("link", { name: "Donate" })).toHaveAttribute(
      "href",
      "https://www.every.org/ai-safety-cape-town?utm_campaign=donate-link#/donate",
    );
    expect(
      within(socialResources).getByRole("link", { name: /substack/i }),
    ).toHaveAttribute("href", "https://aisafetysouthafrica.substack.com/");
    expect(
      within(socialResources).getByRole("link", { name: /substack/i }),
    ).toHaveAttribute("target", "_blank");
    expect(
      within(socialResources).getByRole("link", { name: /substack/i }),
    ).toHaveClass("focus-visible:outline-primary");
    expect(
      within(socialResources).getByRole("link", { name: /luma/i }),
    ).toHaveAttribute("href", "https://lu.ma/calendar/cal-p3BboQFpGbi3ioe");
    expect(
      within(socialResources).getByRole("link", { name: /linkedin/i }),
    ).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/ai-safety-south-africa/",
    );
    expect(
      within(socialResources).getByRole("link", { name: /x\.com/i }),
    ).toHaveAttribute("href", "https://x.com/AI_Safety_SA");
    for (const [name, href] of [
      ["Programs", "/programs"],
      ["Events", "/events"],
      ["Research", "/research"],
    ]) {
      const trackRecordLink = screen.getByRole("link", { name });
      expect(trackRecordLink).toHaveAttribute("href", href);
      expect(trackRecordLink).toHaveClass(
        "bg-card-raised/75",
        "hover:border-primary/45",
        "hover:bg-card-raised",
        "focus-visible:outline-primary",
      );
    }
  });
});
