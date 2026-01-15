import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("desks").collect();
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    x: v.number(),
    y: v.number(),
    type: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("desks", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("desks"),
    label: v.optional(v.string()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("desks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
