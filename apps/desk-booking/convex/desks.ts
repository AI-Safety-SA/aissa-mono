import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: {
    floorPlanId: v.optional(v.id("floorPlans")),
  },
  handler: async (ctx, args) => {
    if (args.floorPlanId) {
      return await ctx.db
        .query("desks")
        .withIndex("by_floorPlan", (q) =>
          q.eq("floorPlanId", args.floorPlanId!),
        )
        .collect();
    }
    return await ctx.db.query("desks").collect();
  },
});

export const getById = query({
  args: { id: v.id("desks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    label: v.string(),
    deskTypeId: v.id("deskTypes"),
    floorPlanId: v.id("floorPlans"),
    x: v.number(),
    y: v.number(),
    rotation: v.optional(v.number()),
    attributeValues: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const deskId = await ctx.db.insert("desks", {
      label: args.label,
      deskTypeId: args.deskTypeId,
      floorPlanId: args.floorPlanId,
      x: args.x,
      y: args.y,
      rotation: args.rotation,
      status: "active",
      attributeValues: args.attributeValues ?? {},
    });

    await ctx.scheduler.runAfter(0, internal.events.emit, {
      type: "desk.created",
      payload: {
        deskId,
        label: args.label,
        floorPlanId: args.floorPlanId,
      },
    });

    return deskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("desks"),
    label: v.optional(v.string()),
    deskTypeId: v.optional(v.id("deskTypes")),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    rotation: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("maintenance"),
        v.literal("removed"),
      ),
    ),
    attributeValues: v.optional(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const desk = await ctx.db.get(id);
    if (!desk) throw new Error("Desk not found");

    // Build patch object excluding undefined values
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    await ctx.db.patch(id, patch);

    await ctx.scheduler.runAfter(0, internal.events.emit, {
      type: "desk.updated",
      payload: {
        deskId: id,
        changes: patch,
      },
    });
  },
});

export const remove = mutation({
  args: { id: v.id("desks") },
  handler: async (ctx, args) => {
    // Soft-delete by setting status to removed
    await ctx.db.patch(args.id, { status: "removed" as const });
  },
});
