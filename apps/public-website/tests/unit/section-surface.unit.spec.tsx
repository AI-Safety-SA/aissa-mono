import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionSurface } from "@/components/section-surface";

describe("SectionSurface", () => {
  it("maps section and container variants to static Tailwind class strings", () => {
    render(
      <SectionSurface surface="alternate" width="narrow" spacing="compact">
        <h2>Primitive section</h2>
      </SectionSurface>,
    );

    const section = screen.getByText("Primitive section").closest("section");
    expect(section).toHaveClass(
      "border-b",
      "border-border/70",
      "bg-card-raised/42",
      "py-12",
    );
    expect(section).not.toHaveClass("border-y");

    const container = screen.getByText("Primitive section").parentElement;
    expect(container).toHaveClass("container", "mx-auto", "max-w-4xl", "px-4");
  });

  it("uses the public website default section surface when variants are omitted", () => {
    render(
      <SectionSurface>
        <h2>Default section</h2>
      </SectionSurface>,
    );

    const section = screen.getByText("Default section").closest("section");
    expect(section).toHaveClass("border-b", "border-border/70", "py-16");
    expect(section).not.toHaveClass("border-y", "bg-card-raised/60");

    const container = screen.getByText("Default section").parentElement;
    expect(container).toHaveClass("container", "mx-auto", "px-4");
  });

  it("supports raised, cta, wide, full, loose, and intro variants", () => {
    const { rerender } = render(
      <SectionSurface surface="raised" width="wide" spacing="loose">
        <h2>Raised wide section</h2>
      </SectionSurface>,
    );

    expect(
      screen.getByText("Raised wide section").closest("section"),
    ).toHaveClass("border-y", "bg-card-raised/60", "py-20");
    expect(screen.getByText("Raised wide section").parentElement).toHaveClass(
      "max-w-7xl",
    );

    rerender(
      <SectionSurface surface="cta" width="full">
        <h2>Full width CTA</h2>
      </SectionSurface>,
    );

    expect(
      screen.getByText("Full width CTA").closest("section"),
    ).not.toHaveClass("border-b", "border-y");
    expect(screen.getByText("Full width CTA").parentElement).toHaveClass(
      "w-full",
    );

    rerender(
      <SectionSurface surface="cta" spacing="intro">
        <h2>Intro spacing section</h2>
      </SectionSurface>,
    );

    expect(
      screen.getByText("Intro spacing section").closest("section"),
    ).toHaveClass("pt-16", "pb-8");
  });
});
