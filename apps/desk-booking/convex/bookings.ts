import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUser } from "./lib/auth";
import {
  getSettings,
  validateBookingDate,
  checkSlotConflict,
  checkPersonSlotConflict,
} from "./lib/validation";

export const create = mutation({
  args: {
    deskId: v.id("desks"),
    date: v.string(),
    slot: v.union(v.literal("morning"), v.literal("afternoon")),
    bookerName: v.string(),
    bookerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate desk exists and is active
    const desk = await ctx.db.get(args.deskId);
    if (!desk || desk.status !== "active") {
      throw new Error("Desk is not available");
    }

    // Validate booking date
    const settings = await getSettings(ctx);
    const maxDays = settings?.maxAdvanceBookingDays ?? 30;
    validateBookingDate(args.date, maxDays);

    // Check for desk slot conflict
    await checkSlotConflict(ctx, args.deskId, args.date, args.slot);

    // Check one desk per person per slot
    await checkPersonSlotConflict(
      ctx,
      args.bookerEmail,
      args.date,
      args.slot,
    );

    // Resolve user if authenticated
    const user = await getUser(ctx);

    const bookingId = await ctx.db.insert("bookings", {
      deskId: args.deskId,
      userId: user?._id,
      bookerName: args.bookerName,
      bookerEmail: args.bookerEmail,
      date: args.date,
      slot: args.slot,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // Emit event
    await ctx.scheduler.runAfter(0, internal.events.emit, {
      type: "booking.created",
      payload: {
        bookingId,
        deskId: args.deskId,
        deskLabel: desk.label,
        date: args.date,
        slot: args.slot,
        bookerName: args.bookerName,
        bookerEmail: args.bookerEmail,
      },
    });

    return bookingId;
  },
});

export const cancel = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    // Authorization: either the booking owner or an admin
    const user = await getUser(ctx);
    if (user && booking.userId && booking.userId !== user._id) {
      if (user.role !== "admin") {
        throw new Error("Not authorized to cancel this booking");
      }
    }

    await ctx.db.patch(args.bookingId, { status: "cancelled" });

    const desk = await ctx.db.get(booking.deskId);

    await ctx.scheduler.runAfter(0, internal.events.emit, {
      type: "booking.cancelled",
      payload: {
        bookingId: args.bookingId,
        deskId: booking.deskId,
        deskLabel: desk?.label ?? "Unknown",
        date: booking.date,
        slot: booking.slot,
        bookerEmail: booking.bookerEmail,
      },
    });
  },
});

export const getByFloorPlanAndDate = query({
  args: {
    floorPlanId: v.id("floorPlans"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const desks = await ctx.db
      .query("desks")
      .withIndex("by_floorPlan", (q) =>
        q.eq("floorPlanId", args.floorPlanId),
      )
      .collect();

    const desksWithBookings = await Promise.all(
      desks
        .filter((d) => d.status !== "removed")
        .map(async (desk) => {
          const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_desk_date", (q) =>
              q.eq("deskId", desk._id).eq("date", args.date),
            )
            .collect();

          const confirmedBookings = bookings.filter(
            (b) => b.status === "confirmed",
          );

          // Get desk type info
          const deskType = await ctx.db.get(desk.deskTypeId);

          return {
            ...desk,
            deskType,
            bookings: confirmedBookings,
            morningBooked: confirmedBookings.some(
              (b) => b.slot === "morning",
            ),
            afternoonBooked: confirmedBookings.some(
              (b) => b.slot === "afternoon",
            ),
          };
        }),
    );

    return desksWithBookings;
  },
});

export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_email", (q) => q.eq("bookerEmail", args.email))
      .collect();
  },
});

export const getMyBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return [];

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_email", (q) => q.eq("bookerEmail", user.email))
      .collect();

    // Enrich with desk info
    return await Promise.all(
      bookings
        .filter((b) => b.status === "confirmed")
        .map(async (booking) => {
          const desk = await ctx.db.get(booking.deskId);
          return { ...booking, desk };
        }),
    );
  },
});

export const listAll = query({
  args: {
    date: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("confirmed"), v.literal("cancelled")),
    ),
  },
  handler: async (ctx, args) => {
    let bookingsQuery;

    if (args.date) {
      bookingsQuery = ctx.db
        .query("bookings")
        .withIndex("by_date", (q) => q.eq("date", args.date!));
    } else {
      bookingsQuery = ctx.db.query("bookings");
    }

    const bookings = await bookingsQuery.collect();

    const filtered = args.status
      ? bookings.filter((b) => b.status === args.status)
      : bookings;

    return await Promise.all(
      filtered.map(async (booking) => {
        const desk = await ctx.db.get(booking.deskId);
        return { ...booking, desk };
      }),
    );
  },
});
