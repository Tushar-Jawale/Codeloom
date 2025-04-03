import React from "react";
import "./RunButton.css";
import { getExecutionResult, CodeEditorService } from "../services/CodeEdtiorService";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { useConvex } from "convex/react";
import toast from "react-hot-toast";

function RunButton() {
  const { runCode, language, isRunning, roomId, username, code } = CodeEditorService();
  const convex = useConvex();

  const handleRun = async () => {
    if (!roomId || !username) {
      toast.error("Room ID and username are required");
      return;
    }
    
    // Run the code using the service
    await runCode(convex);
  };

  return (
    <div className="button-container">
      <motion.button
        onClick={handleRun}
        disabled={isRunning}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="run-button"
      >
        <div className="button-bg" />
        <div className="button-content">
          {isRunning ? (
            <>
              <Loader2 className="loader-icon" />
              <span className="loader-text">Executing...</span>
            </>
          ) : (
            <>
              <Play className="play-icon" />
              <span className="play-text">Run Code</span>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
}

export default RunButton;