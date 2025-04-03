import { ConvexProvider, ConvexReactClient } from "convex/react";

// Create a Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Debug the Convex URL
console.log("Convex URL:", import.meta.env.VITE_CONVEX_URL);

export const getConvexClient = () => convex;

export const saveCodeExecution = async (api, execution) => {
  try {
    const { roomId, username, language, code, output, error } = execution;
    
    console.log("Saving execution to Convex:", { 
      roomId, 
      username, 
      language,
      codeLength: code?.length || 0,
      hasOutput: !!output,
      hasError: !!error
    });
    
    if (!roomId || !username) {
      console.error("Room ID and username are required");
      return;
    }
    
    // Check if the api object has the right methods
    if (!api) {
      console.error("Convex API is null or undefined");
      return null;
    }
    
    if (!api.mutation) {
      console.error("api.mutation is not available", api);
      // Fallback to direct mutation if available
      if (typeof api === 'function') {
        console.log("Trying direct function call with api");
        const result = await api({
          roomId,
          username,
          language,
          code,
          output: output || undefined,
          error: error || undefined,
        });
        console.log("Direct function call result:", result);
        return result;
      }
      return null;
    }
    
    // Try different ways to call the mutation
    try {
      // Attempt 1: Using path notation
      console.log("Attempting mutation with path notation");
      const result = await api.mutation("codeExecution:saveExecution", {
        roomId,
        username,
        language,
        code,
        output: output || undefined,
        error: error || undefined,
      });
      
      console.log("Code execution saved successfully with path notation", result);
      return result;
    } catch (pathError) {
      console.error("Error with path notation:", pathError);
      
      try {
        // Attempt 2: Using direct import reference
        console.log("Attempting mutation with direct reference");
        const result = await api.mutation({
          name: "saveExecution",
          args: {
            roomId,
            username,
            language,
            code,
            output: output || undefined,
            error: error || undefined,
          }
        });
        
        console.log("Code execution saved successfully with direct reference", result);
        return result;
      } catch (directError) {
        console.error("Error with direct reference:", directError);
        throw directError;
      }
    }
  } catch (err) {
    console.error("Error saving code execution:", err);
    // Log more detailed error information
    if (err.message) console.error("Error message:", err.message);
    if (err.stack) console.error("Error stack:", err.stack);
    
    // Try to diagnose the issue
    if (err.message?.includes("function not found")) {
      console.error("The function codeExecution:saveExecution may not exist or is not exported correctly");
    } else if (err.message?.includes("ConvexError")) {
      console.error("Convex validation error - check your schema and function arguments");
    }
    
    return null;
  }
};

export const getRoomExecutions = async (api, roomId, limit = 10) => {
  try {
    if (!roomId) {
      console.error("Room ID is required");
      return [];
    }
    
    return await api.query("codeExecution:getRoomExecutions", {
      roomId,
      limit,
    });
  } catch (err) {
    console.error("Error getting room executions:", err);
    return [];
  }
};

export const getLatestExecution = async (api, roomId) => {
  try {
    if (!roomId) {
      console.error("Room ID is required");
      return null;
    }
    
    return await api.query("codeExecution:getLatestExecution", {
      roomId,
    });
  } catch (err) {
    console.error("Error getting latest execution:", err);
    return null;
  }
};

export const getRoomStats = async (api, roomId) => {
  try {
    if (!roomId) {
      console.error("Room ID is required");
      return null;
    }
    
    return await api.query("codeExecution:getRoomStats", {
      roomId,
    });
  } catch (err) {
    console.error("Error getting room stats:", err);
    return null;
  }
}; 