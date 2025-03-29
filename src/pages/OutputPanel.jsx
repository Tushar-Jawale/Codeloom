import React, { useState } from 'react';
import './OutputPanel.css';

const OutputPanel = ({ code, language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const hasContent = error || output;

  const handleRun = () => {
    setIsRunning(true);
    setOutput('');
    setError('');
    
    // Simulate code execution with a timeout
    setTimeout(() => {
      setIsRunning(false);
      try {
        // This is a very simple simulation - in real scenarios you'd use a proper code execution engine
        if (language === 'javascript') {
          // For JavaScript we can actually try to run it, but in a try/catch to handle errors
          try {
            // Never use eval in production - this is just for demonstration
            // eslint-disable-next-line no-eval
            const result = eval(`
              // Capture console.log output
              let logs = [];
              const originalLog = console.log;
              console.log = (...args) => {
                logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
                originalLog(...args);
              };
              
              try {
                ${code}
                // Return logs as output
                logs.join('\\n');
              } finally {
                // Restore console.log
                console.log = originalLog;
              }
            `);
            setOutput(result || 'Code executed successfully with no output.');
          } catch (err) {
            setError(`${err.name}: ${err.message}`);
          }
        } else {
          // For other languages just show a simulation message
          setOutput(`// Simulated ${language.toUpperCase()} output\n// Run completed successfully`);
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      }
    }, 1500); // Simulate processing delay
  };

  const handleCopy = async () => {
    if (!hasContent) return;
    await navigator.clipboard.writeText(error || output);
    setIsCopied(true);

    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-title">
          <span className="terminal-icon">⌘</span>
          <span>Output</span>
        </div>
        <div className="output-actions">
          {hasContent && (
            <button 
              className="copy-button" 
              onClick={handleCopy}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <button 
            className="run-button" 
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>
      
      <div className="output-content">
        {isRunning ? (
          <RunningCodeSkeleton />
        ) : error ? (
          <div className="error-container">
            <div className="error-title">⚠️ Execution Error</div>
            <pre className="error-message">{error}</pre>
          </div>
        ) : output ? (
          <div className="output-container">
            <div className="output-success">✅ Execution Successful</div>
            <pre className="output-message">{output}</pre>
          </div>
        ) : (
          <div className="empty-output">
            <div className="empty-icon">⏱️</div>
            <p>Run your code to see the output here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel; 