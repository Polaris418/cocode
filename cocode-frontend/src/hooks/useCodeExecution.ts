import axios from 'axios';
import { CodeExecutionRequest, CodeExecutionResult } from '../types';

const PISTON_API_URL = import.meta.env.VITE_PISTON_API_URL || 'https://emkc.org/api/v2/piston';

// Language mapping for Piston API
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  csharp: { language: 'csharp', version: '6.12.0' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
};

export const executeCode = async (
  request: CodeExecutionRequest
): Promise<CodeExecutionResult> => {
  try {
    const langConfig = LANGUAGE_MAP[request.language];
    
    if (!langConfig) {
      return {
        stdout: '',
        stderr: `Language '${request.language}' is not supported`,
        exitCode: 1,
        error: 'Unsupported language',
      };
    }

    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          content: request.code,
        },
      ],
    });

    const { run } = response.data;

    return {
      stdout: run.stdout || '',
      stderr: run.stderr || '',
      exitCode: run.code,
      error: run.signal ? `Process killed by signal: ${run.signal}` : undefined,
    };
  } catch (error: any) {
    return {
      stdout: '',
      stderr: '',
      exitCode: 1,
      error: error.message || 'Execution failed',
    };
  }
};

// Custom hook for code execution with state management
import { useState, useCallback } from 'react';

export const useCodeExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');

  const execute = useCallback(async (language: string, code: string) => {
    setIsExecuting(true);
    setOutput('⏳ Executing code...\n');
    
    try {
      const result = await executeCode({ language, code });
      
      let outputText = '';
      
      if (result.stdout) {
        outputText += `✅ Output:\n${result.stdout}\n`;
      }
      
      if (result.stderr) {
        outputText += `⚠️ Stderr:\n${result.stderr}\n`;
      }
      
      if (result.error) {
        outputText += `❌ Error:\n${result.error}\n`;
      }
      
      outputText += `\n📋 Exit code: ${result.exitCode}`;
      
      setOutput(outputText);
      return result;
    } catch (error: any) {
      const errorMsg = `❌ Execution failed: ${error.message}`;
      setOutput(errorMsg);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
  }, []);

  return { isExecuting, output, execute, clearOutput };
};

