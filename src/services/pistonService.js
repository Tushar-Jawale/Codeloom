const PISTON_RUNTIMES_URL = 'https://emkc.org/api/v2/piston/runtimes';
const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute';

const LANGUAGE_MAPPING = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  csharp: 'csharp',
  cpp: 'c++',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  go: 'go',
  rust: 'rust',
  html: 'html',
  css: 'css',
  sql: 'sqlite3'
};

const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    c: 'c',
    csharp: 'cs',
    'c++': 'cpp',
    php: 'php',
    ruby: 'rb',
    swift: 'swift',
    go: 'go',
    rust: 'rs',
    html: 'html',
    css: 'css',
    sqlite3: 'sql'
  };
  return extensions[language] || 'txt';
};

export const executeCode = async (code, language, input = '') => {
  try {
    const mappedLanguage = LANGUAGE_MAPPING[language.toLowerCase()];
    
    if (!mappedLanguage) {
      return {
        status: 'error',
        error: 'Unsupported programming language',
      };
    }

    const response = await fetch(PISTON_EXECUTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: mappedLanguage,
        version: '*',
        files: [
          {
            name: `main.${getFileExtension(mappedLanguage)}`,
            content: code
          }
        ],
        stdin: input,
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000, 
        compile_memory_limit: 1048576, 
        run_memory_limit: 1048576, 
      }),
    });

    const data = await response.json();

    if (data.message) {
      return {
        status: 'error',
        error: data.message,
      };
    }

    if (data.compile && data.compile.code !== 0) {
      return {
        status: 'error',
        error: data.compile.stderr || data.compile.output,
      };
    }

    if (data.run && data.run.code !== 0) {
      return {
        status: 'error',
        error: data.run.stderr || data.run.output,
      };
    }

    return {
      status: 'success',
      output: data.run.output.trim(),
    };
  } catch (error) {
    console.error('Execution error:', error);
    return {
      status: 'error',
      error: error.message || 'Error executing code',
    };
  }
};

export const getSupportedLanguages = async () => {
  try {
    const response = await fetch(PISTON_RUNTIMES_URL);
    const runtimes = await response.json();
    
    return Object.entries(runtimes)
      .filter(([lang]) => LANGUAGE_MAPPING[lang.toLowerCase()])
      .map(([lang, versions]) => ({
        value: lang.toLowerCase(),
        label: getLanguageLabel(lang),
        icon: getLanguageIcon(lang),
        versions: versions
      }));
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
};

const getLanguageLabel = (language) => {
  const labels = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    c: 'C',
    csharp: 'C#',
    'c++': 'C++',
    php: 'PHP',
    ruby: 'Ruby',
    swift: 'Swift',
    go: 'Go',
    rust: 'Rust',
    html: 'HTML',
    css: 'CSS',
    sqlite3: 'SQL'
  };
  return labels[language] || language;
};

export const getLanguageIcon = (language) => {
  const icons = {
    javascript: '📜',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    c: '📊',
    csharp: '🔷',
    'c++': '🔨',
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