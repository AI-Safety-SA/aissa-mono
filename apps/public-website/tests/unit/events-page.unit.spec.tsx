import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventsPage from "@/app/events/page";
import { getEvents } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getEvents: vi.fn(),
}));

const events = Array.from({ length: 5 }, (_, index) => ({
  attendanceCount: index === 4 ? null : 20 + index,
  eventDate: `2026-05-0${index + 1}`,
  id: index + 1,
  image:
    index === 3
      ? { alt: "Event thumbnail", url: "https://media.example.com/event.jpg" }
      : null,
  location: index === 4 ? null : "Cape Town",
  name: `Event ${index + 1}`,
  slug: `event-${index + 1}`,
  type: index === 1 ? "reading_group" : "workshop",
}));

describe("public website events page", () => {
  it("renders three highlighted events and the remaining events in a table", async () => {
    vi.mocked(getEvents).mockResolvedValue(events);

    render(await EventsPage());

    expect(screen.getByRole("heading", { name: "Events" })).toBeInTheDocument();

    for (const event of events.slice(0, 3)) {
      expect(
        screen.getByRole("heading", { name: event.name }),
      ).toBeInTheDocument();
    }

    const table = screen.getByRole("table");
    expect(within(table).getByText("Event 4")).toBeInTheDocument();
    expect(within(table).getByText("Event 5")).toBeInTheDocument();
    expect(within(table).getByText("May 4, 2026")).toBeInTheDocument();
    expect(within(table).getByText("TBD")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /event/i }),
    ).not.toBeInTheDocument();
  });

  it("renders an empty state when there are no events", async () => {
    vi.mocked(getEvents).mockResolvedValue([]);

    render(await EventsPage());

    const emptyState = screen.getByText("No events to display yet.");
    expect(emptyState).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
