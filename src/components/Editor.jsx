import React, { useRef, useEffect, useState } from 'react';
import {LANGUAGE_CONFIG, defineMonacoThemes, THEMES, THEME_DEFINITIONS} from './languageConfig';
import OutputPanel from '../pages/OutputPanel';
import { LuMoon } from "react-icons/lu";
import { MdOutlineWbSunny } from "react-icons/md";
import { CodeEditorService } from '../services/CodeEdtiorService';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import RunButton from './RunButton';
import './Editor.css';

const Editor = () => {
  const { 
    language, 
    setLanguage, 
    code, 
    fontSize, 
    setFontSize, 
    setEditor, 
    theme,
    setTheme,
    handleChange, 
    handleRefresh
  } = CodeEditorService();
  
  const [isCopied, setIsCopied] = useState(false);
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const editorContainerRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    monacoEditorRef.current = editor;
    monacoInstanceRef.current = monaco;
    setEditor(editor);
    defineMonacoThemes(monaco);
    monaco.editor.setTheme(theme);
    
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.setAttribute('data-theme', theme);
    }
    editor.updateOptions({ 
      fontSize,
      lineHeight: fontSize * 1.5,
      padding: { bottom: 15 },
      lineNumbersMinChars: 3,
      folding: true,
      glyphMargin: false
    });
    editor.layout();
  };

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ 
        fontSize: fontSize,
        lineHeight: fontSize * 1.5,
        lineNumbersMinChars: 3
      });
      monacoEditorRef.current.layout();
    }
  }, [fontSize]);

  useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setTheme(theme);
      if (monacoEditorRef.current) {
        const editorDomNode = monacoEditorRef.current.getDomNode();
        if (editorDomNode) {
          editorDomNode.setAttribute('data-theme', theme);
        }
      }
    }
    if (editorContainerRef.current) {
      editorContainerRef.current.setAttribute('data-theme', theme);
    }
    document.documentElement.setAttribute('data-editor-theme', theme);
    document.body.setAttribute('data-theme', theme);
    const updateElements = (selector, themeAttribute) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.setAttribute('data-theme', themeAttribute);
      });
    };
    updateElements('.output-panel-container', theme);
    updateElements('.input-panel', theme);
    updateElements('.output-panel-right', theme);
    updateElements('.output-area', theme);
    updateElements('.input-textarea', theme);
    
    console.log('Applied theme to root and all elements:', theme);
    
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    setTheme(newTheme);
    setTimeout(() => {
      console.log('Forcing theme update:', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      const updateElements = (selector, themeAttribute) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.setAttribute('data-theme', themeAttribute);
        });
      };
      
      updateElements('.output-panel-container', newTheme);
      updateElements('.input-panel', newTheme);
      updateElements('.output-panel-right', newTheme);
      updateElements('.output-area', newTheme);
      updateElements('.input-textarea', newTheme);
      const outputPanel = document.querySelector('.output-panel-container');
      if (outputPanel) {
        outputPanel.style.display = 'none';
        outputPanel.offsetHeight;
        outputPanel.style.display = 'flex';
      }
    }, 50);
  };

  const handleEditorChange = (value) => {
    handleChange({ target: { value } });
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 1, 24);
    setFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 1, 12);
    setFontSize(newSize);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];
  const monacoLanguage = LANGUAGE_CONFIG[language]?.monacoLanguage || language;
  const isDarkTheme = theme === 'vs-dark';

  return (
    <div className="editor-container-with-output" ref={editorContainerRef} data-theme={theme}>
      <div className="editor-wrapper">
        <div className="editor-header">
          <div className="left-controls">
            <div className="language-selector">
              <div className="language-icon">
                <i className={LANGUAGE_CONFIG[language]?.iconClass}></i>
              </div>
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
            <button 
              className="theme-toggle-button"
              onClick={toggleTheme}
              title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDarkTheme ? (
                <MdOutlineWbSunny />
              ) : (
                <LuMoon />
              )}
            </button>
          </div>
          
          <div className="center-controls">
            <RunButton />
          </div>
          
          <div className="editor-controls">
            <div className="font-size-control">
              <span className="font-label">Font Size:</span>
              <button onClick={decreaseFontSize} className="font-size-button">-</button>
              <span className="font-size-value">{fontSize}</span>
              <button onClick={increaseFontSize} className="font-size-button">+</button>
            </div>
            <button onClick={handleCopy} className="action-button">
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleRefresh} className="action-button">
              Reset
            </button>
          </div>
        </div>
                
        <div className="editor-container" ref={editorWrapperRef}>
          <div className="monaco-editor-container">
            <MonacoEditor
              height="100%"
              width="100%"
              language={monacoLanguage}
              value={code}
              theme={theme}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'Consolas', 'Monaco', 'Fira Code', monospace",
                fontSize: fontSize,
                lineHeight: fontSize * 1.5,
                tabSize: 2,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 12,
                  horizontalScrollbarSize: 12,
                },
                padding: { top: 15, bottom: 15 },
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                wordWrap: 'off',
                lineNumbers: 'on',
                lineNumbersMinChars: 3,
                lineDecorationsWidth: 0,
                folding: true,
                renderLineHighlight: 'line',
                renderIndentGuides: true,
                fixedOverflowWidgets: true,
                guides: {
                  indentation: true,
                  highlightActiveIndentation: true,
                },
                cursorStyle: 'line',
                cursorWidth: 2,
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                colorDecorators: true
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="output-wrapper">
        <div className="output-panel-container" data-theme={theme}>
          <OutputPanel />
        </div>
      </div>
    </div>
  );
};

export default Editor;
