import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getEvent = internalQuery({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

export const getActiveWebhooks = internalQuery({
  args: { eventType: v.string() },
  handler: async (ctx, args) => {
    const allWebhooks = await ctx.db.query("webhooks").collect();
    return allWebhooks.filter(
      (w) => w.isActive && w.eventTypes.includes(args.eventType),
    );
  },
});
