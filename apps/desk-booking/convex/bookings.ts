import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByDate = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Naive implementation: fetch all bookings overlapping with range
    // In production, optimize with range queries
    const bookings = await ctx.db.query("bookings").collect();
    return bookings.filter(b => 
      (b.startTime < args.endTime) && (b.endTime > args.startTime)
    );
  },
});

export const create = mutation({
  args: {
    deskId: v.id("desks"),
    userId: v.string(),
    userName: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Check collision
    const existing = await ctx.db.query("bookings")
        .withIndex("by_desk", (q) => q.eq("deskId", args.deskId))
        .collect();
    
    const collision = existing.some(b => 
        (b.startTime < args.endTime) && (b.endTime > args.startTime)
    );

    if (collision) {
        throw new Error("Desk is already booked for this time slot.");
    }

    return await ctx.db.insert("bookings", args);
  },
});
