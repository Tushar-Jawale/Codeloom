import React from "react";
import { CodeEditorService } from "../services/CodeEdtiorService";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

function RunButton() {
  const { runCode, isRunning} = CodeEditorService();

  const handleRun = async () => {
    await runCode();
  };

  return (
    <div className="button-container">
      <motion.button
        onClick={handleRun}
        disabled={isRunning}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="run-button">
        <div className="button-bg" />
        <div className="button-content">
          {isRunning ? (
            <>
              <motion.div
                animate={{ rotate: 270 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="loader-icon" />
              </motion.div>
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