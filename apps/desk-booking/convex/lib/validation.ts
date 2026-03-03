import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export async function getSettings(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"settings"> | null> {
  const settings = await ctx.db.query("settings").first();
  return settings;
}

export function validateBookingDate(
  date: string,
  maxAdvanceDays: number,
): void {
  const bookingDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new Error("Cannot book a date in the past");
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
  if (bookingDate > maxDate) {
    throw new Error(
      `Cannot book more than ${maxAdvanceDays} days in advance`,
    );
  }
}

export async function checkSlotConflict(
  ctx: QueryCtx | MutationCtx,
  deskId: Id<"desks">,
  date: string,
  slot: "morning" | "afternoon",
  excludeBookingId?: Id<"bookings">,
): Promise<void> {
  const existing = await ctx.db
    .query("bookings")
    .withIndex("by_desk_date", (q) => q.eq("deskId", deskId).eq("date", date))
    .collect();

  const conflict = existing.find(
    (b) =>
      b.slot === slot &&
      b.status === "confirmed" &&
      b._id !== excludeBookingId,
  );

  if (conflict) {
    throw new Error(
      `Desk is already booked for the ${slot} slot on ${date}`,
    );
  }
}

export async function checkPersonSlotConflict(
  ctx: QueryCtx | MutationCtx,
  bookerEmail: string,
  date: string,
  slot: "morning" | "afternoon",
  excludeBookingId?: Id<"bookings">,
): Promise<void> {
  const existing = await ctx.db
    .query("bookings")
    .withIndex("by_email", (q) => q.eq("bookerEmail", bookerEmail))
    .collect();

  const conflict = existing.find(
    (b) =>
      b.date === date &&
      b.slot === slot &&
      b.status === "confirmed" &&
      b._id !== excludeBookingId,
  );

  if (conflict) {
    throw new Error(
      `You already have a booking for the ${slot} slot on ${date}`,
    );
  }
}
