import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    codeExecutions: defineTable({
        roomId: v.string(),
        username: v.string(),
        language: v.string(),
        code: v.string(),
        output: v.optional(v.string()),
        error: v.optional(v.string()),
        timestamp: v.number(),
      })
      .index("by_room_id", ["roomId"])
      .index("by_room_and_time", ["roomId", "timestamp"]),
});