import React from "react";
import "./RunButton.css";
import { getExecutionResult, CodeEditorService } from "../services/CodeEdtiorService";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

function RunButton() {
  const { runCode, language, isRunning } = CodeEditorService();

  const handleRun = async () => {
    await runCode();
    const result = getExecutionResult();
    if (result) {
      console.log({
        language,
        code: result.code,
        output: result.output || undefined,
        error: result.error || undefined,
      });
    }
  };

  return (
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
  );
}

export default RunButton;