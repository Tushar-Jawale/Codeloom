export const LANGUAGE_CONFIG = {
  javascript: {
    id: "javascript",
    label: "JavaScript",
    logoPath: "/javascript.png",
    pistonRuntime: { language: "javascript", version: "18.15.0" },
    monacoLanguage: "javascript",
    defaultCode: "// Write your JavaScript code here\nconst greeting = \"Hello World\";\nconsole.log(greeting);",
  },
  typescript: {
    id: "typescript",
    label: "TypeScript",
    logoPath: "/typescript.png",
    pistonRuntime: { language: "typescript", version: "5.0.3" },
    monacoLanguage: "typescript",
    defaultCode: "// Write your TypeScript code here\nlet message: string = \"Hello TypeScript\";\nconsole.log(message);",
  },
  python: {
    id: "python",
    label: "Python",
    logoPath: "/python.png",
    pistonRuntime: { language: "python", version: "3.10.0" },
    monacoLanguage: "python",
    defaultCode: "# Write your Python code here\ngreeting = \"Hello Python\"\nprint(greeting)",
  },
  java: {
    id: "java",
    label: "Java",
    logoPath: "/java.png",
    pistonRuntime: { language: "java", version: "15.0.2" },
    monacoLanguage: "java",
    defaultCode: "// Write your Java code here\npublic class Main {\n  public static void main(String[] args) {\n    String greeting = \"Hello Java\";\n    System.out.println(greeting);\n  }\n}",
  },
  go: {
    id: "go",
    label: "Go",
    logoPath: "/go.png",
    pistonRuntime: { language: "go", version: "1.16.2" },
    monacoLanguage: "go",
    defaultCode: "// Write your Go code here\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  greeting := \"Hello Go\"\n  fmt.Println(greeting)\n}",
  },
  rust: {
    id: "rust",
    label: "Rust",
    logoPath: "/rust.png",
    pistonRuntime: { language: "rust", version: "1.68.2" },
    monacoLanguage: "rust",
    defaultCode: "// Write your Rust code here\nfn main() {\n  let greeting = \"Hello Rust\";\n  println!(\"{}\", greeting);\n}",
  },
  cpp: {
    id: "cpp",
    label: "C++",
    logoPath: "/cpp.png",
    pistonRuntime: { language: "cpp", version: "10.2.0" },
    monacoLanguage: "cpp",
    defaultCode: "// Write your C++ code here\n#include <iostream>\n\nusing namespace std;\n\nint main() {\n  string greeting = \"Hello C++\";\n  cout << greeting << endl;\n  return 0;\n}",
  },
  csharp: {
    id: "csharp",
    label: "C#",
    logoPath: "/csharp.png",
    pistonRuntime: { language: "csharp", version: "6.12.0" },
    monacoLanguage: "csharp",
    defaultCode: "// Write your C# code here\nusing System;\n\nclass Program {\n  static void Main() {\n    string greeting = \"Hello C#\";\n    Console.WriteLine(greeting);\n  }\n}",
  },
  ruby: {
    id: "ruby",
    label: "Ruby",
    logoPath: "/ruby.png",
    pistonRuntime: { language: "ruby", version: "3.0.1" },
    monacoLanguage: "ruby",
    defaultCode: "# Write your Ruby code here\ngreeting = \"Hello Ruby\"\nputs greeting",
  },
  swift: {
    id: "swift",
    label: "Swift",
    logoPath: "/swift.png",
    pistonRuntime: { language: "swift", version: "5.3.3" },
    monacoLanguage: "swift",
    defaultCode: "// Write your Swift code here\nlet greeting = \"Hello Swift\"\nprint(greeting)",
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