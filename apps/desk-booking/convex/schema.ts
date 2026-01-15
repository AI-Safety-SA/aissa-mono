import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  desks: defineTable({
    label: v.string(),
    x: v.number(),
    y: v.number(),
    type: v.string(), // "standard", "monitor", "standing"
    status: v.string(), // "active", "inactive"
  }),
  bookings: defineTable({
    deskId: v.id("desks"),
    userId: v.string(), // We'll store user ID here
    userName: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  })
  .index("by_desk", ["deskId"])
  .index("by_time", ["startTime", "endTime"]),
  
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(), // "admin", "user"
  }).index("by_email", ["email"]),
});
