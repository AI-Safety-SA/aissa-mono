import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  deskTypes: defineTable({
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
    isActive: v.boolean(),
  }),

  floorPlans: defineTable({
    name: v.string(),
    width: v.number(),
    height: v.number(),
    backgroundImageId: v.optional(v.id("_storage")),
    isDefault: v.boolean(),
    sortOrder: v.number(),
  }),

  desks: defineTable({
    label: v.string(),
    deskTypeId: v.id("deskTypes"),
    floorPlanId: v.id("floorPlans"),
    x: v.number(),
    y: v.number(),
    rotation: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("removed"),
    ),
    attributeValues: v.record(v.string(), v.any()),
  }).index("by_floorPlan", ["floorPlanId"]),

  bookings: defineTable({
    deskId: v.id("desks"),
    userId: v.optional(v.id("users")),
    bookerName: v.string(),
    bookerEmail: v.string(),
    date: v.string(),
    slot: v.union(v.literal("morning"), v.literal("afternoon")),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.number(),
  })
    .index("by_desk_date", ["deskId", "date"])
    .index("by_email", ["bookerEmail"])
    .index("by_date", ["date"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  settings: defineTable({
    morningSlotStart: v.string(),
    morningSlotEnd: v.string(),
    afternoonSlotStart: v.string(),
    afternoonSlotEnd: v.string(),
    maxAdvanceBookingDays: v.number(),
    orgName: v.string(),
    orgEmail: v.string(),
  }),

  webhooks: defineTable({
    url: v.string(),
    eventTypes: v.array(v.string()),
    isActive: v.boolean(),
    secret: v.optional(v.string()),
  }),

  events: defineTable({
    type: v.string(),
    payload: v.record(v.string(), v.any()),
    timestamp: v.number(),
    delivered: v.boolean(),
  })
    .index("by_type", ["type"])
    .index("by_undelivered", ["delivered"]),
});
