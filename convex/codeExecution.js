import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveExecution = mutation({
  args: {
    roomId: v.string(),
    username: v.string(),
    language: v.string(),
    code: v.string(),
    input: v.optional(v.string()),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a clean object to handle null values properly
    const data = {
      roomId: args.roomId,
      username: args.username,
      language: args.language,
      code: args.code,
      timestamp: Date.now(),
    };
    
    // Only add input if it's not null
    if (args.input !== null && args.input !== undefined) {
      data.input = args.input;
    }
    
    // Only add output if it's not null
    if (args.output !== null && args.output !== undefined) {
      data.output = args.output;
    }
    
    // Only add error if it's not null
    if (args.error !== null && args.error !== undefined) {
      data.error = args.error;
    }
    
    return await ctx.db.insert("codeExecutions", data);
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
