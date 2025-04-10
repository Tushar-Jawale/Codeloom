import { ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

console.log("Convex URL:", import.meta.env.VITE_CONVEX_URL);

export const getConvexClient = () => convex;

export const saveCodeExecution = async (convex, data) => {
  if (!convex) return null;
  
  // Create a clean object to send to the mutation
  const cleanData = {
    roomId: data.roomId,
    username: data.username,
    language: data.language,
    code: data.code,
  };
  
  // Only add input if it's not null or undefined
  if (data.input !== null && data.input !== undefined) {
    cleanData.input = data.input;
  }
  
  // Only add output if it's not null or undefined
  if (data.output !== null && data.output !== undefined) {
    cleanData.output = data.output;
  }
  
  // Only add error if it's not null and not undefined
  if (data.error !== null && data.error !== undefined) {
    cleanData.error = data.error;
  }
  
  return await convex.mutation(api.codeExecution.saveExecution, cleanData);
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