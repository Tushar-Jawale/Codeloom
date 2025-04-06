import { CodeEditorService } from "../services/CodeEdtiorService";
import { AlertTriangle, CheckCircle, Clock, Terminal } from "lucide-react";
import "./OutputPanel.css";
import RunButton from "../components/RunButton";

function OutputPanel() {
  const { output, error, isRunning, executionResult } = CodeEditorService();

  const hasContent = error || output;

  return (
    <div className="output-panel-container">
      <div className="output-panel-header">
        <div className="output-panel-title">
          <div className="output-icon-container">
            <Terminal className="terminal-icon" />
          </div>
          <span className="output-title">Output</span>
        </div>

        <div className="output-panel-actions">
          <RunButton />
        </div>
      </div>

      <div className="output-area">
        <div className="output-content">
          {isRunning ? (
            <div className="code-skeleton" />
          ) : error ? (
            <div className="error-message">
              <AlertTriangle className="icon" />
              <div className="error-details">
                <div className="error-title">Execution Error</div>
                <pre className="error-text">{error}</pre>
              </div>
            </div>
          ) : output ? (
            <div className="success-message">
              <CheckCircle className="icon" />
              <span className="success-title">Execution Successful</span>
              <pre className="output-text">{output}</pre>
            </div>
          ) : (
            <div className="idle-message">
              <Clock className="icon" />
              <p>Run your code to see the output here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;
