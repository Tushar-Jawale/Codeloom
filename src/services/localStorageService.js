// Local storage based service to replace Convex functionality

// Helper to generate a unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Save execution data to local storage
export const saveCodeExecution = async (data) => {
  try {
    if (!data.roomId || !data.username) return null;
    
    // Get existing executions for this room
    const executions = getExecutionsFromStorage(data.roomId) || [];
    
    // Create a new execution record
    const newExecution = {
      _id: generateId(),
      roomId: data.roomId,
      username: data.username,
      language: data.language,
      code: data.code,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // Add to the beginning of the array
    executions.unshift(newExecution);
    
    // Store back in localStorage (limit to 50 executions per room to avoid storage issues)
    const limitedExecutions = executions.slice(0, 50);
    localStorage.setItem(`executions-${data.roomId}`, JSON.stringify(limitedExecutions));
    
    return newExecution;
  } catch (error) {
    console.error("Error saving execution:", error);
    return null;
  }
};

// Get executions for a room from local storage
export const getRoomExecutions = async (roomId, limit = 10) => {
  if (!roomId) return [];
  
  try {
    const executions = getExecutionsFromStorage(roomId) || [];
    return executions.slice(0, limit);
  } catch (error) {
    console.error("Error getting room executions:", error);
    return [];
  }
};

// Get the latest execution for a room
export const getLatestExecution = async (roomId) => {
  if (!roomId) return null;
  
  try {
    const executions = getExecutionsFromStorage(roomId) || [];
    return executions.length > 0 ? executions[0] : null;
  } catch (error) {
    console.error("Error getting latest execution:", error);
    return null;
  }
};

// Get statistics for a room
export const getRoomStats = async (roomId) => {
  if (!roomId) return null;
  
  try {
    const executions = getExecutionsFromStorage(roomId) || [];
    
    // Basic stats
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(exec => !exec.error).length;
    const failedExecutions = totalExecutions - successfulExecutions;
    
    // Count by language
    const languageCounts = executions.reduce((acc, exec) => {
      acc[exec.language] = (acc[exec.language] || 0) + 1;
      return acc;
    }, {});
    
    // Count by user
    const userCounts = executions.reduce((acc, exec) => {
      acc[exec.username] = (acc[exec.username] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      languageCounts,
      userCounts
    };
  } catch (error) {
    console.error("Error getting room stats:", error);
    return null;
  }
};

// Helper function to get executions from storage
const getExecutionsFromStorage = (roomId) => {
  const storedData = localStorage.getItem(`executions-${roomId}`);
  return storedData ? JSON.parse(storedData) : [];
}; 