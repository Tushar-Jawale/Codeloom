import React, { useRef, useEffect, useState } from 'react';
import {LANGUAGE_CONFIG, defineMonacoThemes, THEMES, THEME_DEFINITIONS} from './languageConfig';
import OutputPanel from '../pages/OutputPanel';
import { CodeEditorService, getLanguageIcon } from '../services/CodeEdtiorService';
import { Editor as MonacoEditor } from '@monaco-editor/react';
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
  
  const [lines, setLines] = useState(['1']);
  const [isCopied, setIsCopied] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const themeDropdownRef = useRef(null);
  const editorWrapperRef = useRef(null);

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

  // Apply theme changes to Monaco
  useEffect(() => {
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
  }, [theme]);

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ fontSize });
    }
    
    if (lineNumbersRef.current) {
      lineNumbersRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  // Update line numbers when code changes
  useEffect(() => {
    const lineCount = code.split('\n').length;
    const newLines = Array.from({ length: lineCount }, (_, i) => (i + 1).toString());
    setLines(newLines);
  }, [code]);
  
  // Sync scroll position between editor and line numbers
  useEffect(() => {
    const syncLineNumbersScroll = () => {
      if (!monacoEditorRef.current || !lineNumbersRef.current) return;
      
      const editorDomNode = monacoEditorRef.current.getDomNode();
      if (!editorDomNode) return;
      
      const scrollableElement = editorDomNode.querySelector('.monaco-scrollable-element');
      if (!scrollableElement) return;
      
      const handleEditorScroll = () => {
        if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = scrollableElement.scrollTop;
        }
      };
      
      scrollableElement.addEventListener('scroll', handleEditorScroll);
      return () => {
        scrollableElement.removeEventListener('scroll', handleEditorScroll);
      };
    };
    
    // Run the sync function when the editor reference is set
    const cleanup = syncLineNumbersScroll();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  return (
    <div className="editor-container-with-output">
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
            
            {/* Enhanced theme selector */}
            <div className="theme-selector" ref={themeDropdownRef}>
              <button 
                className="theme-select-button"
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                title="Change editor theme"
              >
                <div 
                  className="theme-color-indicator" 
                  style={{ backgroundColor: currentTheme.color }}
                />
                <span>{currentTheme.label}</span>
                <svg className={`dropdown-arrow ${showThemeDropdown ? 'open' : ''}`} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showThemeDropdown && (
                <div className="theme-dropdown-menu">
                  {THEMES.map(t => (
                    <div 
                      key={t.id} 
                      className={`theme-option ${theme === t.id ? 'active' : ''}`}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeDropdown(false);
                      }}
                    >
                      <div 
                        className="theme-color-preview" 
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          <div className="line-numbers" ref={lineNumbersRef}>
            {lines.map((num, i) => (
              <div key={i} className="line-number">{num}</div>
            ))}
          </div>
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
                lineNumbers: 'off', // Turn off Monaco's built-in line numbers
                lineNumbersMinChars: 4,
                glyphMargin: false,
                folding: true,
                renderLineHighlight: 'line',
                renderIndentGuides: true,
                lineDecorationsWidth: 0, // Reduce space for line decorations since we have our own line numbers
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
        <div className="output-panel-container">
          <OutputPanel />
        </div>
      </div>
    </div>
  );
};

export default Editor;
