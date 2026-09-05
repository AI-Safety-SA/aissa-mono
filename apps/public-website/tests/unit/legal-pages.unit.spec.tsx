import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CodeOfConductPage from "@/app/code-of-conduct/page";
import PrivacyPolicyPage from "@/app/privacy-policy/page";

describe("public website legal pages", () => {
  it("renders the privacy policy intro through the shared section surface", () => {
    const { container } = render(<PrivacyPolicyPage />);

    expect(
      screen.getByRole("heading", {
        name: "AI Safety SA Privacy and Data Policy",
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("main")).not.toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Read AI Safety SA Privacy and Data Policy",
      }),
    ).toHaveAttribute(
      "href",
      "https://sage-creature-2af.notion.site/CISAI-AISSA-Privacy-Data-Policy-37bdf66d372281778292d5daeaa97d45",
    );
  });

  it("renders the code of conduct intro through the shared section surface", () => {
    const { container } = render(<CodeOfConductPage />);

    expect(
      screen.getByRole("heading", { name: "AI Safety SA Code of Conduct" }),
    ).toBeInTheDocument();
    expect(container.querySelector("main")).not.toBeInTheDocument();
    expect(screen.getByText("Legal")).toBeInTheDocument();
    expect(screen.getByTitle("AI Safety SA Code of Conduct")).toHaveAttribute(
      "src",
      "https://aisafetysa.getoutline.com/s/aa885466-1262-41f1-8f3d-e3b02d701539",
    );
  });
});
