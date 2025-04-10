import React, { useRef, useEffect, useState } from 'react';
import {LANGUAGE_CONFIG, defineMonacoThemes, THEMES, THEME_DEFINITIONS} from './languageConfig';
import OutputPanel from '../pages/OutputPanel';
import { LuMoon } from "react-icons/lu";
import { MdOutlineWbSunny } from "react-icons/md";
import { CodeEditorService, getLanguageIcon } from '../services/CodeEdtiorService';
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
      padding: { bottom: 15 }
    });
  };

  // Apply theme changes to Monaco and entire component
  useEffect(() => {
    // Apply theme to document root first (for all CSS variables)
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme to Monaco editor
    if (monacoInstanceRef.current) {
      monacoInstanceRef.current.editor.setTheme(theme);
      
      // Update data-theme attribute when theme changes
      if (monacoEditorRef.current) {
        const editorDomNode = monacoEditorRef.current.getDomNode();
        if (editorDomNode) {
          editorDomNode.setAttribute('data-theme', theme);
        }
      }
    }
    
    // Apply theme to the entire container
    if (editorContainerRef.current) {
      editorContainerRef.current.setAttribute('data-theme', theme);
    }
    
    // Apply theme to document for broader application
    document.documentElement.setAttribute('data-editor-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Update UI colors based on theme
    const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];
    const isDark = theme !== 'vs-light';
    
    // Update inner elements directly to force style refresh
    const updateElements = (selector, themeAttribute) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.setAttribute('data-theme', themeAttribute);
      });
    };
    
    // Update all themed elements
    updateElements('.output-panel-container', theme);
    updateElements('.input-panel', theme);
    updateElements('.output-panel-right', theme);
    updateElements('.output-area', theme);
    updateElements('.input-textarea', theme);
    
    console.log('Applied theme to root and all elements:', theme);
    
  }, [theme]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  const toggleTheme = () => {
    const newTheme = theme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    setTheme(newTheme);
    
    // Force theme update through a delayed call
    setTimeout(() => {
      console.log('Forcing theme update:', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
      
      // Force update on all theme-sensitive elements
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
      
      // For any stubborn elements, try forcing a repaint
      const outputPanel = document.querySelector('.output-panel-container');
      if (outputPanel) {
        outputPanel.style.display = 'none';
        outputPanel.offsetHeight; // Force repaint
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
            
            {/* Theme toggle button */}
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
              <span className="font-size-value">{fontSize}px</span>
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
                tabSize: 2,
                scrollbar: {
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
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
                lineNumbersMinChars: 4,
                glyphMargin: false,
                folding: true,
                renderLineHighlight: 'line',
                renderIndentGuides: true,
                lineDecorationsWidth: 10,
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
