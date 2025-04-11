export const LANGUAGE_CONFIG = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    logoPath: "/javascript.png",
    iconClass: "devicon-javascript-plain colored",
    judge0Runtime: { language: "javascript" },
    monacoLanguage: "javascript",
    defaultCode: "// Write your Javascript code here",
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    logoPath: "/typescript.png",
    iconClass: "devicon-typescript-plain colored",
    judge0Runtime: { language: "typescript" },
    monacoLanguage: "typescript",
    defaultCode: "// Write your Typescript code here",
  },
  python: {
    id: "python",
    label: "Python",
    logoPath: "/python.png",
    iconClass: "devicon-python-plain colored",
    judge0Runtime: { language: "python" },
    monacoLanguage: "python",
    defaultCode: "# Write your Python code here",
  },
  java: {
    id: "java",
    label: "Java",
    logoPath: "/java.png",
    iconClass: "devicon-java-plain colored",
    judge0Runtime: { language: "java" },
    monacoLanguage: "java",
    defaultCode: "// Write your Java code here",
  },
  go: {
    id: "go",
    label: "Go",
    logoPath: "/go.png",
    iconClass: "devicon-go-plain colored",
    judge0Runtime: { language: "go" },
    monacoLanguage: "go",
    defaultCode: "// Write your GO code here",
  },
  c: {
    id: "c",
    label: "C",
    logoPath: "/c.png",
    iconClass: "devicon-c-plain colored",
    judge0Runtime: { language: "c" },
    monacoLanguage: "c",
    defaultCode: "// Write your C code here",
  },
  rust: {
    id: "rust",
    label: "Rust",
    logoPath: "/rust.png",
    iconClass: "devicon-rust-plain colored",
    judge0Runtime: { language: "rust" },
    monacoLanguage: "rust",
    defaultCode: "// Write your Rust code here",
  },
  cpp: {
    id: "cpp",
    label: "C++",
    logoPath: "/cpp.png",
    iconClass: "devicon-cplusplus-plain colored",
    judge0Runtime: { language: "cpp" },
    monacoLanguage: "cpp",
    defaultCode: "// Write your C++ code here",
  },
  csharp: {
    id: "csharp",
    label: "C#",
    logoPath: "/csharp.png",
    iconClass: "devicon-csharp-plain colored",
    judge0Runtime: { language: "csharp" },
    monacoLanguage: "csharp",
    defaultCode: "// Write your C# code here",
  },
  ruby: {
    id: "ruby",
    label: "Ruby",
    logoPath: "/ruby.png",
    iconClass: "devicon-ruby-plain colored",
    judge0Runtime: { language: "ruby" },
    monacoLanguage: "ruby",
    defaultCode: "# Write your Ruby code here",
  },
  swift: {
    id: "swift",
    label: "Swift",
    logoPath: "/swift.png",
    iconClass: "devicon-swift-plain colored",
    judge0Runtime: { language: "swift" },
    monacoLanguage: "swift",
    defaultCode: "// Write your Swift code here",
  },
  kotlin: {
    id: "kotlin",
    label: "Kotlin",
    logoPath: "/kotlin.png",
    iconClass: "devicon-kotlin-plain colored",
    judge0Runtime: { language: "kotlin" },
    monacoLanguage: "kotlin",
    defaultCode: "// Write your Kotlin code here",
  },

  scala: {
    id: "scala",
    label: "Scala",
    logoPath: "/scala.png",
    iconClass: "devicon-scala-plain colored",
    judge0Runtime: { language: "scala" },
    monacoLanguage: "scala",
    defaultCode: "// Write your Scala code here",
  },
};

export default LANGUAGE_CONFIG;

// Define the available themes
export const THEMES = [
  { id: "vs-dark", label: "Dark Theme", color: "#1e1e1e" },
  { id: "vs-light", label: "Light Theme", color: "#ffffff" }
];

// Theme definitions
export const THEME_DEFINITIONS = {
  // Keep only vs-dark and vs-light, which are built-in Monaco themes
};

// Helper function to define themes in Monaco
export const defineMonacoThemes = (monaco) => {
  // Define all themes with complete token rules
  Object.entries(THEME_DEFINITIONS).forEach(([themeName, themeData]) => {
    monaco.editor.defineTheme(themeName, {
      base: themeData.base,
      inherit: themeData.inherit,
      rules: themeData.rules.map((rule) => ({
        ...rule,
        foreground: rule.foreground,
        fontStyle: rule.fontStyle || '',
      })),
      colors: themeData.colors,
    });
  });
};