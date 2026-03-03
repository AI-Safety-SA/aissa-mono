import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("webhooks").collect();
  },
});

export const register = mutation({
  args: {
    url: v.string(),
    eventTypes: v.array(v.string()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("webhooks", {
      url: args.url,
      eventTypes: args.eventTypes,
      isActive: true,
      secret: args.secret,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("webhooks"),
    url: v.optional(v.string()),
    eventTypes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    secret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("webhooks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
