import React, { useState, useRef, useEffect } from 'react';
import LANGUAGE_CONFIG from './languageConfig';
import OutputPanel from '../pages/OutputPanel';
import { getLanguageIcon } from '../services/pistonService';
import './Editor.css';

const Editor = () => {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_CONFIG[language].defaultCode);
  const [lines, setLines] = useState(['1']);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('editor-font-size');
    return saved ? parseInt(saved) : 14;
  });
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.fontSize = `${fontSize}px`;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(LANGUAGE_CONFIG[language].defaultCode);
    }
  }, [language]);

  useEffect(() => {
    const lineCount = code.split('\n').length;
    const newLines = Array.from({ length: lineCount }, (_, i) => (i + 1).toString());
    setLines(newLines);
  }, [code]);

  const handleTextAreaScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleChange = (e) => {
    setCode(e.target.value);
    localStorage.setItem(`editor-code-${language}`, e.target.value);
  };

  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      const newText = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newText);
      
      setTimeout(() => {
        textareaRef.current.selectionStart = start + 2;
        textareaRef.current.selectionEnd = start + 2;
      }, 0);
    }
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 1, 24);
    setFontSize(newSize);
    localStorage.setItem('editor-font-size', newSize.toString());
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 1, 12);
    setFontSize(newSize);
    localStorage.setItem('editor-font-size', newSize.toString());
  };

  const handleRefresh = () => {
    setCode(LANGUAGE_CONFIG[language].defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  return (
    <div className="editor-container-with-output">
      <div className="editor-wrapper">
        <div className="editor-header">
          <div className="language-selector">
            <div className="language-icon">{getLanguageIcon(language)}</div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-select"
            >
              {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <div className="editor-controls">
            <div className="font-size-control">
              <span className="font-label">Font Size:</span>
              <button onClick={decreaseFontSize} className="font-size-button">-</button>
              <span className="font-size-value">{fontSize}px</span>
              <button onClick={increaseFontSize} className="font-size-button">+</button>
            </div>
            <button onClick={handleRefresh} className="refresh-button">
              Reset
            </button>
          </div>
        </div>

        <div className="editor-container">
          <div ref={lineNumbersRef} className="line-numbers">
            {lines.map((line, index) => (
              <div key={index} className="line-number">{line}</div>
            ))}
          </div>
          <div className="editor-scrollbar">
            <textarea 
              ref={textareaRef}
              value={code}
              onChange={handleChange}
              onScroll={handleTextAreaScroll}
              onKeyDown={handleTab}
              className="code-textarea"
              spellCheck="false"
              wrap="off"
              placeholder={`Write your ${LANGUAGE_CONFIG[language].label} code here...`}
            />
          </div>
        </div>
      </div>
      
      <div className="output-wrapper">
        <div className="output-panel-container">
          <OutputPanel code={code} language={language} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
