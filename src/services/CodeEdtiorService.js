import LANGUAGE_CONFIG from "../components/languageConfig"
import { create } from "zustand";
import { saveCodeExecution } from "./localStorageService";
import { executeCode } from "./judge0Service";

const DEFAULT_CPU_TIME_LIMIT = 5;
const DEFAULT_MEMORY_LIMIT = 128000;

const getCpuTimeLimit = () => {
  try {
    return typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_CPU_TIME_LIMIT ? 
      Number(process.env.NEXT_PUBLIC_CPU_TIME_LIMIT) : DEFAULT_CPU_TIME_LIMIT;
  } catch (error) {
    return DEFAULT_CPU_TIME_LIMIT;
  }
};

const getMemoryLimit = () => {
  try {
    return typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_MEMORY_LIMIT ? 
      Number(process.env.NEXT_PUBLIC_MEMORY_LIMIT) : DEFAULT_MEMORY_LIMIT;
  } catch (error) {
    return DEFAULT_MEMORY_LIMIT;
  }
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
      
      if (editor.getValue) {
        return editor.getValue();
      }
      
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
    
    setOutputResults: (output, error, executionResult) => {
      set({ 
        output: output || "",
        error: error || null,
        executionResult: executionResult || null 
      });
    },

    runCode: async () => {
      const { language, roomId, username, input } = get();
      const codeToRun = get().getCode();
    
      if (!codeToRun) {
        set({ error: "Please enter some code" });
        return;
      }
    
      set({ isRunning: true, error: null, output: "" });
    
      try {
        if (!LANGUAGE_CONFIG[language]) {
          set({ error: `Language ${language} is not supported` });
          return;
        }
    
        if (!LANGUAGE_CONFIG[language].judge0Runtime) {
          set({ error: `Language ${language} runtime is not configured` });
          return;
        }
    
        let data;
        try {
          data = await executeCode(codeToRun, language, input);
          console.log("Execution data received:", data);
        } catch (serviceError) {
          console.error("Error from Judge0 service:", serviceError);
          const errorMsg = serviceError?.message || "Unknown error during execution";
          const result = { code: codeToRun, output: "", error: errorMsg };
          set({ error: errorMsg, executionResult: result });
          try {
            await saveCodeExecution({
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
    
        const output = data.output || data.stdout || data.run?.output || "";
        const stderr = data.error || data.stderr || data.run?.stderr || "";
    
        const allOutput = output || stderr || "No output";
    
        const result = {
          code: codeToRun,
          output: allOutput.trim(),
          error: stderr ? stderr.trim() : null,
        };
    
        set({
          output: allOutput.trim(),
          error: stderr ? stderr.trim() : null,
          executionResult: result,
        });
    
        try {
          await saveCodeExecution({
            input,
            roomId,
            username,
            language,
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
