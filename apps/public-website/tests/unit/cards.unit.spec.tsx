import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  EventCard,
  EventTable,
  ProgramCard,
  ResearchCard,
  TestimonialCard,
} from "@/components/cards";

describe("public website card surfaces", () => {
  it("keeps program card navigation and external link semantics on the consolidated media surface", () => {
    render(
      <ProgramCard
        externalHref="https://example.org/fellowship"
        program={{
          description: "A technical program for AI safety practice.",
          id: 1,
          image: {
            alt: "Program participants",
            url: "https://media.example.com/program.jpg",
          },
          name: "AI Safety Fellowship",
          slug: "ai-safety-fellowship",
          totalParticipants: 24,
          type: "fellowship",
        }}
      />,
    );

    const titleLink = screen.getByRole("link", {
      name: "AI Safety Fellowship",
    });
    expect(titleLink).toHaveAttribute("href", "/programs/ai-safety-fellowship");
    expect(titleLink.closest("[data-slot='card']")).toHaveClass(
      "bg-card/88",
      "shadow-card",
      "hover:-translate-y-1",
      "hover:border-brand-coral/45",
      "hover:shadow-card-hover",
    );

    const externalLink = screen.getByRole("link", { name: /visit website/i });
    expect(externalLink).toHaveAttribute(
      "href",
      "https://example.org/fellowship",
    );
    expect(externalLink).toHaveAttribute("target", "_blank");
    expect(externalLink).toHaveAttribute("rel", "noreferrer");
  });

  it("keeps research card external links on the text-interactive surface", () => {
    render(
      <ResearchCard
        research={{
          arxivLink: "https://arxiv.org/abs/2605.00001",
          authors: [{ authorName: "Jane Researcher" }],
          id: 21,
          slug: "aissa-alignment-note",
          status: "published",
          title: "AISSA Alignment Note",
          venueType: "workshop",
        }}
      />,
    );

    const openLink = screen.getByRole("link", { name: /open/i });
    expect(openLink).toHaveAttribute(
      "href",
      "https://arxiv.org/abs/2605.00001",
    );
    expect(openLink).toHaveAttribute("target", "_blank");
    expect(openLink).toHaveAttribute("rel", "noreferrer");
    expect(openLink.closest("[data-slot='card']")).toHaveClass(
      "bg-card/88",
      "shadow-card",
      "hover:border-primary/40",
      "hover:shadow-card-hover",
    );
  });

  it("links event table entries to Luma when a public URL is available", () => {
    render(
      <EventTable
        events={[
          {
            attendanceCount: 42,
            eventDate: "2026-05-01",
            id: 1,
            image: null,
            location: "Cape Town",
            lumaPublicUrl: "https://luma.com/alignment-workshop",
            name: "Alignment Workshop",
            slug: "alignment-workshop",
            type: "workshop",
          },
        ]}
      />,
    );

    const table = screen.getByRole("table");
    expect(table.parentElement).toHaveClass(
      "overflow-x-auto",
      "rounded-lg",
      "border",
      "bg-card/88",
      "shadow-card",
    );
    const eventLink = within(table).getByRole("link", {
      name: /alignment workshop/i,
    });
    expect(eventLink).toHaveAttribute(
      "href",
      "https://luma.com/alignment-workshop",
    );
    expect(eventLink).toHaveAttribute("target", "_blank");
    expect(eventLink).toHaveAttribute("rel", "noreferrer");
    expect(
      within(table).getByText("Alignment Workshop").closest("tr"),
    ).toHaveClass("hover:bg-card-raised/42");

    const fallbackImage = within(table).getByTestId("event-fallback-image");
    expect(fallbackImage).toHaveAttribute("alt", "Default logo");
    expect(fallbackImage).toHaveAttribute(
      "src",
      expect.stringContaining("aissa-logo-square.png"),
    );
  });

  it("does not render unsafe Luma URLs as event table links", () => {
    render(
      <EventTable
        events={[
          {
            attendanceCount: 42,
            eventDate: "2026-05-01",
            id: 1,
            image: null,
            location: "Cape Town",
            lumaPublicUrl: "javascript:alert('xss')",
            name: "Alignment Workshop",
            slug: "alignment-workshop",
            type: "workshop",
          },
        ]}
      />,
    );

    const table = screen.getByRole("table");
    expect(
      within(table).queryByRole("link", { name: /alignment workshop/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps event table entries as text when no Luma URL is available", () => {
    render(
      <EventTable
        events={[
          {
            attendanceCount: 42,
            eventDate: "2026-05-01",
            id: 1,
            image: null,
            location: "Cape Town",
            name: "Alignment Workshop",
            slug: "alignment-workshop",
            type: "workshop",
          },
        ]}
      />,
    );

    const table = screen.getByRole("table");
    expect(
      within(table).queryByRole("link", { name: /alignment workshop/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the AISSA square logo and Luma link on event cards", () => {
    const { container } = render(
      <EventCard
        event={{
          attendanceCount: 42,
          eventDate: "2026-05-01",
          id: 1,
          image: null,
          location: "Cape Town",
          lumaPublicUrl: "https://luma.com/alignment-workshop",
          name: "Alignment Workshop",
          slug: "alignment-workshop",
          type: "workshop",
        }}
      />,
    );

    const fallbackImage = within(container).getByTestId("event-fallback-image");
    expect(fallbackImage).toHaveAttribute("alt", "Default logo");
    expect(fallbackImage).toHaveAttribute(
      "src",
      expect.stringContaining("aissa-logo-square.png"),
    );

    const eventLink = screen.getByRole("link", {
      name: /alignment workshop/i,
    });
    expect(eventLink).toHaveAttribute(
      "href",
      "https://luma.com/alignment-workshop",
    );
    expect(eventLink).toHaveAttribute("target", "_blank");
    expect(eventLink).toHaveAttribute("rel", "noreferrer");
  });

  it("does not render unsafe Luma URLs as event card links", () => {
    render(
      <EventCard
        event={{
          attendanceCount: 42,
          eventDate: "2026-05-01",
          id: 1,
          image: null,
          location: "Cape Town",
          lumaPublicUrl: "data:text/html,<script>alert('xss')</script>",
          name: "Alignment Workshop",
          slug: "alignment-workshop",
          type: "workshop",
        }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /alignment workshop/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Alignment Workshop")).toBeInTheDocument();
  });

  it("does not render unsafe research URLs as links", () => {
    render(
      <ResearchCard
        research={{
          arxivLink: "javascript:alert('xss')",
          authors: [{ authorName: "Jane Researcher" }],
          id: 21,
          slug: "aissa-alignment-note",
          status: "published",
          title: "AISSA Alignment Note",
          venueType: "workshop",
        }}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /open/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps testimonial cards on their dedicated contrast surface", () => {
    render(
      <TestimonialCard
        testimonial={{
          attributionName: "AISSA participant",
          attributionTitle: "Fellow",
          contextKind: "program",
          id: 1,
          quote: "This helped me find a concrete path into AI safety.",
        }}
      />,
    );

    expect(
      screen.getByText(/concrete path into AI safety/i).closest("div"),
    ).toHaveClass("bg-testimonial-card", "shadow-card");
  });
});
