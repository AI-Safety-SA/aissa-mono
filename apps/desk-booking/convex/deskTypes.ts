import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("deskTypes").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
    attributes: v.array(
      v.object({
        key: v.string(),
        label: v.string(),
        valueType: v.union(
          v.literal("boolean"),
          v.literal("string"),
          v.literal("number"),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deskTypes", {
      name: args.name,
      color: args.color,
      icon: args.icon,
      attributes: args.attributes,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("deskTypes"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    attributes: v.optional(
      v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          valueType: v.union(
            v.literal("boolean"),
            v.literal("string"),
            v.literal("number"),
          ),
        }),
      ),
    ),
    isActive: v.optional(v.boolean()),
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
  args: { id: v.id("deskTypes") },
  handler: async (ctx, args) => {
    // Soft-delete: mark as inactive
    await ctx.db.patch(args.id, { isActive: false });
  },
});
