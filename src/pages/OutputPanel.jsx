import { CodeEditorService } from "../services/CodeEdtiorService";
import { AlertTriangle, CheckCircle, Clock, Terminal, Type } from "lucide-react";
import "./OutputPanel.css";
import RunButton from "../components/RunButton";
import { useState } from "react";

function OutputPanel() {
  const { output, error, isRunning, executionResult, setInput } = CodeEditorService();
  const [inputText, setInputText] = useState("");

  const hasContent = error || output;

  const formatOutput = (text) => {
    if (!text) return "";
    return text.split('\n').map((line, index) => (
      <div key={index} className="output-line">
        {line}
      </div>
    ));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    setInput(value); 
  };

  return (
    <div className="output-panel-container">
      <div className="output-panel-header">
        <div className="output-panel-title">
          <div className="output-icon-container">
            <Terminal className="terminal-icon" />
          </div>
          <span className="output-title">Output Panel</span>
        </div>

        <div className="output-panel-actions">
          <RunButton />
        </div>
      </div>

      <div className="split-panel">
        <div className="input-panel">
          <div className="input-panel-header">
            <div className="input-panel-title">
              <Type className="input-icon" />
              <span className="input-title">Input</span>
            </div>
          </div>
          <textarea 
            className="input-textarea" 
            placeholder="Enter input for your code here..." 
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        <div className="output-panel-right">
          <div className="output-panel-right-header">
            <div className="output-panel-right-title">
              <Terminal className="output-icon" />
              <span className="output-title">Output</span>
            </div>
          </div>
          <div className="output-area">
            <div className="output-content">
              {isRunning ? (
                <div className="code-skeleton">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              ) : error ? (
                <div className="error-message">
                  <AlertTriangle className="icon" />
                  <div className="error-details">
                    <div className="error-title">Execution Error</div>
                    <div className="error-text">{error}</div>
                  </div>
                </div>
              ) : output ? (
                <>
                  <div className="output-container">
                    <div className="output-text">{formatOutput(output)}</div>
                  </div>
                </>
              ) : (
                <div className="idle-message">
                  <Clock className="icon" />
                  <p>Run your code to see the output here...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;
