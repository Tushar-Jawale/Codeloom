import { ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

console.log("Convex URL:", import.meta.env.VITE_CONVEX_URL);

export const getConvexClient = () => convex;

export const saveCodeExecution = async (convex, data) => {
  if (!convex) return null;
  return await convex.mutation(api.codeExecution.saveExecution, {
    roomId: data.roomId,
    username: data.username,
    language: data.language,
    code: data.code,
    output: data.output || "",
    error: data.error || null,
  });
};

export const getRoomExecutions = async (convex, roomId, limit = 10) => {
  if (!convex) return [];
  return await convex.query(api.codeExecution.getRoomExecutions, { roomId, limit });
};

export const getLatestExecution = async (convex, roomId) => {
  if (!convex) return null;
  return await convex.query(api.codeExecution.getLatestExecution, { roomId });
};

export const getRoomStats = async (convex, roomId) => {
  if (!convex) return null;
  return await convex.query(api.codeExecution.getRoomStats, { roomId });
}; 