import LANGUAGE_CONFIG from "../components/languageConfig"
import { create } from "zustand";
import { getConvexClient, saveCodeExecution } from "./convexService";

export const getLanguageIcon = (language) => {
  const icons = {
    javascript: '📜',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    c: '📊',
    csharp: '🔷',
    cpp: '🔨',
    php: '🐘',
    ruby: '💎',
    swift: '🦅',
    go: '🐹',
    rust: '🦀',
    html: '🌐',
    css: '🎨',
    sqlite3: '🗃️'
  };
  return icons[language] || '📝';
};

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 14,
      theme: "vs-dark",
      roomId: "",
      username: "",
      code: LANGUAGE_CONFIG["javascript"].defaultCode,
    };
  }

  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;
  const savedRoomId = localStorage.getItem("room-id") || "";
  const savedUsername = localStorage.getItem("username") || "";
  const savedCode = localStorage.getItem(`editor-code-${savedLanguage}`);
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";

  return {
    language: savedLanguage,
    fontSize: Number(savedFontSize),
    theme: savedTheme,
    roomId: savedRoomId,
    username: savedUsername,
    code: savedCode || LANGUAGE_CONFIG[savedLanguage].defaultCode,
  };
};

export const CodeEditorService = create((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    input: null,
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,
    

    getCode: () => {
      const editor = get().editor;
      if (!editor) return get().code;
      
      // Handle Monaco editor
      if (editor.getValue) {
        return editor.getValue();
      }
      
      // Handle textarea
      if (editor.value !== undefined) {
        return editor.value;
      }
      
      return get().code;
    },

    setInput: (input) => {
      set({ input });
    },

    setEditor: (editor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) {
        if (editor.setValue) {
          editor.setValue(savedCode);
        }
        else if (editor.value !== undefined) {
          editor.value = savedCode;
        }
      }
      
      set({ editor });
    },

    setTheme: (theme) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language) => {
      const editor = get().editor;
      if (editor) {
        let currentCode;
        if (editor.getValue) {
          currentCode = editor.getValue();
        }
        // Handle textarea
        else if (editor.value !== undefined) {
          currentCode = editor.value;
        }
        
        if (currentCode) {
          localStorage.setItem(`editor-code-${get().language}`, currentCode);
        }
      }

      localStorage.setItem("editor-language", language);
      
      const savedCode = localStorage.getItem(`editor-code-${language}`);
      const code = savedCode || LANGUAGE_CONFIG[language].defaultCode;
      
      set({
        language,
        code,
        output: "",
        error: null,
      });
    },

    setCode: (code) => {
      set({ code });
    },

    handleChange: (e) => {
      const code = e.target.value;
      localStorage.setItem(`editor-code-${get().language}`, code);
      set({ code });
    },

    handleRefresh: () => {
      const language = get().language;
      const code = LANGUAGE_CONFIG[language].defaultCode;
      localStorage.removeItem(`editor-code-${language}`);
      set({ code });
    },

    setRoomId: (roomId) => {
      localStorage.setItem("room-id", roomId);
      set({ roomId });
    },

    setUsername: (username) => {
      localStorage.setItem("username", username);
      set({ username });
    },

    runCode: async (convex) => {
      const { language, code, roomId, username, input } = get();
      const codeToRun = get().getCode();

      if (!codeToRun) {
        set({ error: "Please enter some code" });
        return;
      }

      if (!roomId || !username) {
        set({ error: "Room ID and username are required" });
        return;
      }

      if (!convex) {
        set({ error: "API connection error" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        if (!LANGUAGE_CONFIG[language]) {
          set({ error: `Language ${language} is not supported` });
          return;
        }
        
        if (!LANGUAGE_CONFIG[language].pistonRuntime) {
          set({ error: `Language ${language} runtime is not configured` });
          return;
        }
        
        const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
        
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: codeToRun }],
            stdin: input,
            run_timeout: 10000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          set({ error: `Execution service error: ${response.status}` });
          
          // Save to Convex
          const result = { code: codeToRun, output: "", error: `Execution service error: ${response.status}` };
          try {
            await saveCodeExecution(convex, {
              input,
              roomId,
              username,
              language,
              ...result
            });
          } catch (saveError) {
            console.error("Failed to save execution:", saveError);
          }
          return;
        }

        const data = await response.json();

        // handle API-level errors
        if (data.message) {
          const result = { code: codeToRun, output: "", error: data.message };
          set({ error: data.message, executionResult: result });
          
          // Save to Convex
          try {
            await saveCodeExecution(convex, {
              input,
              roomId,
              username,
              language,
              ...result
            });
          } catch (saveError) {
            console.error("Failed to save execution:", saveError);
          }
          return;
        }

        // handle compilation errors
        if (data.compile && data.compile.code !== 0) {
          const errorMsg = data.compile.stderr || data.compile.output;
          const result = { code: codeToRun, output: "", error: errorMsg };
          set({
            error: errorMsg,
            executionResult: result,
          });
          
          // Save to Convex
          try {
            await saveCodeExecution(convex, {
              roomId,
              username,
              language,
              input,
              ...result
            });
          } catch (saveError) {
            console.error("Failed to save execution:", saveError);
          }
          return;
        }

        if (data.run && data.run.code !== 0) {
          const errorMsg = data.run.stderr || data.run.output;
          const result = { code: codeToRun, output: "", error: errorMsg };
          set({
            error: errorMsg,
            executionResult: result,
          });
          
          // Save to Convex
          try {
            await saveCodeExecution(convex, {
              roomId,
              username,
              language,
              input,
              ...result
            });
          } catch (saveError) {
            console.error("Failed to save execution:", saveError);
          }
          return;
        }

        // if we get here, execution was successful
        const output = data.run.output;
        const result = { code: codeToRun, output: output.trim(), error: null };
        
        set({
          output: output.trim(),
          error: null,
          executionResult: result,
        });
        
        // Save successful execution to Convex
        try {
          await saveCodeExecution(convex, {
            roomId,
            username,
            language,
            input,
            ...result
          });
        } catch (saveError) {
          console.error("Failed to save execution:", saveError);
        }
      } catch (error) {
        console.error("Error running code:", error);
        const errorMsg = "Error running code";
        const result = { code: codeToRun, output: "", error: errorMsg };
        
        set({
          error: errorMsg,
          executionResult: result,
        });
        
        // Save to Convex
        try {
          await saveCodeExecution(convex, {
            roomId,
            username,
            language,
            input,
            ...result
          });
        } catch (saveError) {
          console.error("Failed to save execution:", saveError);
        }
      } finally {
        set({ isRunning: false });
      }
    },

    clearOutput: () => {
      set({ output: "", error: null, executionResult: null });
    },
  };
});

export const getExecutionResult = () => CodeEditorService.getState().executionResult;
