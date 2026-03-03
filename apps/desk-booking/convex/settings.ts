import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const DEFAULT_SETTINGS = {
  morningSlotStart: "08:00",
  morningSlotEnd: "12:00",
  afternoonSlotStart: "13:00",
  afternoonSlotEnd: "17:00",
  maxAdvanceBookingDays: 30,
  orgName: "AISSA Hub",
  orgEmail: "hub@aissa.org.za",
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? DEFAULT_SETTINGS;
  },
});

export const update = mutation({
  args: {
    morningSlotStart: v.optional(v.string()),
    morningSlotEnd: v.optional(v.string()),
    afternoonSlotStart: v.optional(v.string()),
    afternoonSlotEnd: v.optional(v.string()),
    maxAdvanceBookingDays: v.optional(v.number()),
    orgName: v.optional(v.string()),
    orgEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();

    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    // Create settings with defaults + overrides
    return await ctx.db.insert("settings", {
      ...DEFAULT_SETTINGS,
      ...patch,
    });
  },
});
