import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveExecution = mutation({
  args: {
    roomId: v.string(),
    username: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("codeExecutions", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getRoomExecutions = query({
  args: {
    roomId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("codeExecutions")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(limit);
  },
});

export const getLatestExecution = query({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeExecutions")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .first();
  },
});

export const getRoomStats = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query("codeExecutions")
      .withIndex("by_room_id")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .collect();

    // Calculate execution stats
    const last24Hours = executions.filter(
      (e) => e.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    const languageStats = executions.reduce(
      (acc, curr) => {
        acc[curr.language] = (acc[curr.language] || 0) + 1;
        return acc;
      },
      {}
    );

    const languages = Object.keys(languageStats);
    const favoriteLanguage = languages.length
      ? languages.reduce((a, b) => (languageStats[a] > languageStats[b] ? a : b))
      : "N/A";

    // Get unique users
    const uniqueUsers = new Set(executions.map(e => e.username)).size;

    return {
      totalExecutions: executions.length,
      languagesCount: languages.length,
      languages: languages,
      last24Hours,
      favoriteLanguage,
      languageStats,
      uniqueUsers,
    };
  },
});
