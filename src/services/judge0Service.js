const JUDGE0_API_URL = import.meta.env.VITE_JUDGE0_API_URL;
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

if (!JUDGE0_API_URL || !RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  throw new Error('Judge0 API configuration is missing. Please set VITE_JUDGE0_API_URL, VITE_RAPIDAPI_KEY, and VITE_RAPIDAPI_HOST in your environment variables.');
}

const toBase64 = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
};

const fromBase64 = (str) => {
    return decodeURIComponent(escape(atob(str)));
};

const LANGUAGE_IDS = {
    "javascript": 63,
    "typescript": 74,
    "python": 71,
    "java": 62,
    "c": 50,
    "cpp": 53,
    "ruby": 72,
    "go": 60,
    "rust": 73,
    "scala": 81,
    "csharp": 51,
    "kotlin": 78,
    "swift": 83,
};

// Create a new submission
const createSubmission = async (sourceCode, languageId, input = '') => {
    try {
        const response = await fetch(`${JUDGE0_API_URL}/submissions/?base64_encoded=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            },
            body: JSON.stringify({
                source_code: toBase64(sourceCode),
                language_id: languageId,
                stdin: toBase64(input),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data.error || 'Failed to create submission';
            throw new Error(errMsg);
        }

        return data.token;
    } catch (error) {
        console.error('Error creating submission:', error);
        throw error;
    }
};

const getSubmissionResult = async (token) => {
    try {
        const response = await fetch(`${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': RAPIDAPI_HOST
            }
        });

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data.error || 'Failed to fetch submission result';
            throw new Error(errMsg);
        }

        return data;
    } catch (error) {
        console.error('Error getting submission result:', error);
        throw error;
    }
};

const executeCode = async (sourceCode, language, input = '') => {
  try {
      const languageId = LANGUAGE_IDS[language.toLowerCase()];
      if (!languageId) {
          throw new Error(`Unsupported language: ${language}`);
      }

      const token = await createSubmission(sourceCode, languageId, input);

      let result = null;
      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
          result = await getSubmissionResult(token);

          const statusId = result.status?.id;
          if (statusId !== 1 && statusId !== 2) break;

          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
      }

      if (!result) {
          throw new Error('Failed to fetch execution result');
      }

      const statusDesc = result.status?.description || 'Unknown';
      const executionTime = result.time;
      const memory = result.memory;

      if (result.status?.id === 6 && result.compile_output) {
          const errorMsg = fromBase64(result.compile_output);
          throw new Error(`Compilation Error: ${errorMsg}`);
      }

      if (result.stderr) {
          const errorMsg = fromBase64(result.stderr);
          throw new Error(`Runtime Error: ${errorMsg}`);
      }

      if (result.message) {
          throw new Error(`Execution Message: ${result.message}`);
      }

      if (!result.stdout) {
          throw new Error('No output received');
      }

      const output = fromBase64(result.stdout);

      return {
          output: output.trim(),
          error: null,
          status: statusDesc,
          executionTime,
          memory,
      };

  } catch (error) {
      console.error('Error executing code:', error.message);
      throw new Error(error.message || 'Unknown error occurred');
  }
};

export {
    executeCode,
    LANGUAGE_IDS,
};