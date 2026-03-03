import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query("floorPlans").collect();
    return plans.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const getById = query({
  args: { id: v.id("floorPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    width: v.number(),
    height: v.number(),
    isDefault: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // If this is set as default, unset any existing default
    if (args.isDefault) {
      const existing = await ctx.db.query("floorPlans").collect();
      for (const plan of existing) {
        if (plan.isDefault) {
          await ctx.db.patch(plan._id, { isDefault: false });
        }
      }
    }

    const plans = await ctx.db.query("floorPlans").collect();

    return await ctx.db.insert("floorPlans", {
      name: args.name,
      width: args.width,
      height: args.height,
      isDefault: args.isDefault ?? plans.length === 0,
      sortOrder: args.sortOrder ?? plans.length,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("floorPlans"),
    name: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    backgroundImageId: v.optional(v.id("_storage")),
    isDefault: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If setting as default, unset existing default
    if (updates.isDefault) {
      const existing = await ctx.db.query("floorPlans").collect();
      for (const plan of existing) {
        if (plan.isDefault && plan._id !== id) {
          await ctx.db.patch(plan._id, { isDefault: false });
        }
      }
    }

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
  args: { id: v.id("floorPlans") },
  handler: async (ctx, args) => {
    // Check for associated desks
    const desks = await ctx.db
      .query("desks")
      .withIndex("by_floorPlan", (q) => q.eq("floorPlanId", args.id))
      .collect();

    const activeDesks = desks.filter((d) => d.status !== "removed");
    if (activeDesks.length > 0) {
      throw new Error(
        "Cannot delete floor plan with active desks. Remove all desks first.",
      );
    }

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getBackgroundUrl = query({
  args: { floorPlanId: v.id("floorPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.floorPlanId);
    if (!plan?.backgroundImageId) return null;
    return await ctx.storage.getUrl(plan.backgroundImageId);
  },
});
