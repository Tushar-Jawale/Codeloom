const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveCodeExecution = async (data) => {
  try {
    if (!data.roomId || !data.username) return null;
    
    const executions = getExecutionsFromStorage(data.roomId) || [];
    
    const newExecution = {
      _id: generateId(),
      roomId: data.roomId,
      username: data.username,
      language: data.language,
      code: data.code,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    executions.unshift(newExecution);
    
    const limitedExecutions = executions.slice(0, 50);
    localStorage.setItem(`executions-${data.roomId}`, JSON.stringify(limitedExecutions));
    
    return newExecution;
  } catch (error) {
    console.error("Error saving execution:", error);
    return null;
  }
};

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

export const getRoomStats = async (roomId) => {
  if (!roomId) return null;
  
  try {
    const executions = getExecutionsFromStorage(roomId) || [];
    
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(exec => !exec.error).length;
    const failedExecutions = totalExecutions - successfulExecutions;
    
    const languageCounts = executions.reduce((acc, exec) => {
      acc[exec.language] = (acc[exec.language] || 0) + 1;
      return acc;
    }, {});
    
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

const getExecutionsFromStorage = (roomId) => {
  const storedData = localStorage.getItem(`executions-${roomId}`);
  return storedData ? JSON.parse(storedData) : [];
}; 