import React, { useState, useRef, useEffect } from 'react';
import LANGUAGE_CONFIG from './languageConfig';
import OutputPanel from '../pages/OutputPanel';
import CustomScrollbar from './CustomScrollbar';
import './Editor.css';

const Editor = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_CONFIG[language].defaultCode);
  const [lines, setLines] = useState(['1']);
  const [fontSize, setFontSize] = useState(14);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Load saved code and font size on mount
  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(LANGUAGE_CONFIG[language].defaultCode);
    }
    
    const savedFontSize = localStorage.getItem('editor-font-size');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, [language]);

  // Update line numbers when code changes
  useEffect(() => {
    const lineCount = code.split('\n').length;
    const newLines = Array.from({ length: lineCount }, (_, i) => (i + 1).toString());
    setLines(newLines);
  }, [code]);

  // Sync line numbers with textarea scroll
  const handleTextAreaScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleChange = (e) => {
    setCode(e.target.value);
    // Save code to localStorage
    localStorage.setItem(`editor-code-${language}`, e.target.value);
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      // Insert 2 spaces for tab
      const newText = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newText);
      
      // Put cursor after the inserted tab
      setTimeout(() => {
        textareaRef.current.selectionStart = start + 2;
        textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleFontSizeChange = (newSize) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem('editor-font-size', size.toString());
  };

  const handleRefresh = () => {
    setCode(LANGUAGE_CONFIG[language].defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  return (
    <div className="editor-container-with-output">
      <div className="editor-wrapper">
        {/* Header */}
        <div className="editor-header">
          <div className="language-selector">
            <div className="language-icon">{LANGUAGE_CONFIG[language].icon}</div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              {Object.keys(LANGUAGE_CONFIG).map(lang => (
                <option key={lang} value={lang}>
                  {LANGUAGE_CONFIG[lang].name}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-controls">
            <div className="font-size-control">
              <span className="font-label">Font Size:</span>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                className="font-slider"
              />
              <span className="font-size-value">{fontSize}</span>
            </div>
            <button onClick={handleRefresh} className="refresh-button">
              Reset
            </button>
          </div>
        </div>

        {/* Editor Container with Custom Scrollbar */}
        <div className="editor-container" style={{ fontSize: `${fontSize}px` }}>
          <div ref={lineNumbersRef} className="line-numbers">
            {lines.map((line, index) => (
              <div key={index} className="line-number">{line}</div>
            ))}
          </div>
          <CustomScrollbar className="editor-scrollbar">
            <textarea 
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onScroll={handleTextAreaScroll}
              onKeyDown={handleTab}
              className="code-textarea"
              spellCheck="false"
              wrap="off"
              placeholder={`Write your ${LANGUAGE_CONFIG[language].name} code here...`}
            />
          </CustomScrollbar>
        </div>
      </div>
      
      {/* Output Panel with Custom Scrollbar */}
      <div className="output-wrapper">
        <CustomScrollbar>
          <div className="output-panel-container">
            <OutputPanel code={code} language={language} />
          </div>
        </CustomScrollbar>
      </div>
    </div>
  );
};

export default Editor;
