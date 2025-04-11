import { CodeEditorService } from "../services/CodeEdtiorService";
import { AlertTriangle, Clock, Terminal, Type, X } from "lucide-react";
import "./OutputPanel.css";
import { useState, useEffect } from "react";


function OutputPanel() {
  const { output, error, isRunning, executionResult, setInput, theme, clearOutput } = CodeEditorService();
  const [inputText, setInputText] = useState("");
  const [inputSizeWarning, setInputSizeWarning] = useState(false);

  // Log theme changes
  useEffect(() => {
    console.log("Theme updated in OutputPanel:", theme);
  }, [theme]);

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
  
  const handleClearInput = () => {
    setInputText("");
    setInput("");
    setInputSizeWarning(false);
  };

  return (
    <div className="output-panel-container" data-theme={theme}>
      <div className="split-panel">
        <div className="input-panel" data-theme={theme}>
          <div className="input-panel-header">
            <div className="input-panel-title">
              <Type size={16} className="input-icon" />
              <span className="input-title">Input</span>
              {inputSizeWarning && (
                <span className="input-warning">
                  <AlertTriangle size={14} />
                  Input size exceeds limit
                </span>
              )}
            </div>
            
            <button className="clear-button input-clear-button" onClick={handleClearInput} title="Clear input">
              Clear
            </button> 
          </div>
          <textarea 
            className={`input-textarea ${inputSizeWarning ? 'input-size-warning' : ''}`} 
            placeholder="Enter input for your code here..." 
            value={inputText} 
            onChange={handleInputChange} 
            data-theme={theme} 
          />
          {inputSizeWarning && (
            <div className="size-warning-message">
              Your input exceeds the maximum size limit (64KB). 
              The code might not execute properly.
            </div>
          )}
        </div>

        <div className="output-panel-right" data-theme={theme}>
          <div className="output-panel-right-header">
            <div className="output-panel-right-title">
              <Terminal size={16} className="output-icon" />
              <span className="output-title">Output</span>
            </div>
          </div>
          <div className="output-area" data-theme={theme}>
            <div className="output-content">
              {isRunning ? (
                <div className="code-skeleton">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                </div>
              ) : output ? (
                <div className="output-text">{formatOutput(output)}</div>
              ) : error ? (
                <div className="error-message">
                  <AlertTriangle className="icon" />
                  <div className="error-details">
                    <div className="error-title">Execution Error</div>
                    <div className="error-text">{error}</div>
                  </div>
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
      </div>
    </div>
  );
}

export default OutputPanel;
