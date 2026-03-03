import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const emit = internalMutation({
  args: {
    type: v.string(),
    payload: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      type: args.type,
      payload: args.payload,
      timestamp: Date.now(),
      delivered: false,
    });

    // Schedule webhook delivery
    await ctx.scheduler.runAfter(0, internal.webhookDelivery.deliver, {
      eventId,
    });

    // Schedule email if booking event
    if (args.type === "booking.created") {
      await ctx.scheduler.runAfter(
        0,
        internal.email.sendBookingConfirmation,
        {
          bookingId: args.payload.bookingId as string,
        },
      );
    } else if (args.type === "booking.cancelled") {
      await ctx.scheduler.runAfter(
        0,
        internal.email.sendBookingCancellation,
        {
          bookingId: args.payload.bookingId as string,
        },
      );
    }

    return eventId;
  },
});

export const listByType = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const markDelivered = internalMutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { delivered: true });
  },
});
