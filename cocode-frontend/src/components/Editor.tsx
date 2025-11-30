import { useRef, useEffect, useCallback } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { useApp } from '../context/AppContext';
import { setWsProvider } from '../context/AppContext';
import { CODE_TEMPLATES } from '../constants';
import { CollaboratorInfo } from '../types';

// Configure Monaco Editor before loading
loader.init().then((monaco) => {
  // Configure JavaScript/TypeScript compiler options
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  // Enable built-in diagnostics
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Add extra libraries for better IntelliSense
  const libSource = `
    declare class Console {
      log(...args: any[]): void;
      error(...args: any[]): void;
      warn(...args: any[]): void;
      info(...args: any[]): void;
      debug(...args: any[]): void;
      clear(): void;
      time(label?: string): void;
      timeEnd(label?: string): void;
      table(data: any): void;
    }
    declare var console: Console;
    
    declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
    declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): number;
    declare function clearTimeout(id: number): void;
    declare function clearInterval(id: number): void;
    
    declare function parseInt(s: string, radix?: number): number;
    declare function parseFloat(s: string): number;
    
    interface Array<T> {
      map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
      filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[];
      reduce<U>(callbackfn: (prev: U, curr: T, index: number, array: T[]) => U, initialValue: U): U;
      forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
      find(predicate: (value: T, index: number, array: T[]) => boolean): T | undefined;
      some(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
      every(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
      includes(searchElement: T): boolean;
      indexOf(searchElement: T): number;
      join(separator?: string): string;
      slice(start?: number, end?: number): T[];
      splice(start: number, deleteCount?: number, ...items: T[]): T[];
      push(...items: T[]): number;
      pop(): T | undefined;
      shift(): T | undefined;
      unshift(...items: T[]): number;
      reverse(): T[];
      sort(compareFn?: (a: T, b: T) => number): T[];
      length: number;
    }
    
    interface String {
      charAt(pos: number): string;
      charCodeAt(index: number): number;
      concat(...strings: string[]): string;
      indexOf(searchString: string, position?: number): number;
      lastIndexOf(searchString: string, position?: number): number;
      slice(start?: number, end?: number): string;
      substring(start: number, end?: number): string;
      toLowerCase(): string;
      toUpperCase(): string;
      trim(): string;
      split(separator: string | RegExp, limit?: number): string[];
      replace(searchValue: string | RegExp, replaceValue: string): string;
      includes(searchString: string, position?: number): boolean;
      startsWith(searchString: string, position?: number): boolean;
      endsWith(searchString: string, endPosition?: number): boolean;
      repeat(count: number): string;
      padStart(targetLength: number, padString?: string): string;
      padEnd(targetLength: number, padString?: string): string;
      length: number;
    }
    
    interface Math {
      abs(x: number): number;
      ceil(x: number): number;
      floor(x: number): number;
      round(x: number): number;
      max(...values: number[]): number;
      min(...values: number[]): number;
      pow(x: number, y: number): number;
      sqrt(x: number): number;
      random(): number;
      PI: number;
      E: number;
    }
    declare var Math: Math;
    
    interface JSON {
      parse(text: string): any;
      stringify(value: any, replacer?: any, space?: number): string;
    }
    declare var JSON: JSON;
    
    interface Object {
      keys(o: object): string[];
      values(o: object): any[];
      entries(o: object): [string, any][];
      assign<T, U>(target: T, source: U): T & U;
    }
    declare var Object: Object;
    
    declare class Promise<T> {
      constructor(executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void);
      then<U>(onFulfilled?: (value: T) => U | Promise<U>): Promise<U>;
      catch<U>(onRejected?: (reason: any) => U | Promise<U>): Promise<T | U>;
      finally(onFinally?: () => void): Promise<T>;
      static resolve<T>(value: T): Promise<T>;
      static reject<T>(reason?: any): Promise<T>;
      static all<T>(promises: Promise<T>[]): Promise<T[]>;
      static race<T>(promises: Promise<T>[]): Promise<T>;
    }
    
    declare function fetch(url: string, options?: any): Promise<Response>;
    
    interface Response {
      json(): Promise<any>;
      text(): Promise<string>;
      ok: boolean;
      status: number;
    }
  `;

  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, 'ts:global.d.ts');
  monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, 'ts:global.d.ts');

  // Register custom Python snippets and completions
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print(${1:message})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print to console', range },
        { label: 'def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'def ${1:function_name}(${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Define a function', range },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName}:\n\tdef __init__(self${2:, params}):\n\t\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Define a class', range },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop', range },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while ${1:condition}:\n\t${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop', range },
        { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition}:\n\t${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement', range },
        { label: 'elif', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'elif ${1:condition}:\n\t${2:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Elif statement', range },
        { label: 'else', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'else:\n\t${1:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Else statement', range },
        { label: 'try', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try-except block', range },
        { label: 'with', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'with ${1:expression} as ${2:variable}:\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'With statement', range },
        { label: 'lambda', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'lambda ${1:x}: ${2:x}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Lambda function', range },
        { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import ${1:module}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Import module', range },
        { label: 'from', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'from ${1:module} import ${2:name}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'From import', range },
        { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Return the length', range },
        { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range(${1:stop})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Generate a range', range },
        { label: 'list', kind: monaco.languages.CompletionItemKind.Function, insertText: 'list(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create a list', range },
        { label: 'dict', kind: monaco.languages.CompletionItemKind.Function, insertText: 'dict(${1:})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Create a dictionary', range },
        { label: 'str', kind: monaco.languages.CompletionItemKind.Function, insertText: 'str(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to string', range },
        { label: 'int', kind: monaco.languages.CompletionItemKind.Function, insertText: 'int(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to integer', range },
        { label: 'float', kind: monaco.languages.CompletionItemKind.Function, insertText: 'float(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Convert to float', range },
        { label: 'input', kind: monaco.languages.CompletionItemKind.Function, insertText: 'input(${1:prompt})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Read input', range },
        { label: 'open', kind: monaco.languages.CompletionItemKind.Function, insertText: "open('${1:filename}', '${2:r}')", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Open a file', range },
        { label: 'enumerate', kind: monaco.languages.CompletionItemKind.Function, insertText: 'enumerate(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Enumerate iterable', range },
        { label: 'zip', kind: monaco.languages.CompletionItemKind.Function, insertText: 'zip(${1:iter1}, ${2:iter2})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Zip iterables', range },
        { label: 'map', kind: monaco.languages.CompletionItemKind.Function, insertText: 'map(${1:func}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Map function', range },
        { label: 'filter', kind: monaco.languages.CompletionItemKind.Function, insertText: 'filter(${1:func}, ${2:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Filter iterable', range },
        { label: 'sorted', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sorted(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Return sorted list', range },
        { label: 'sum', kind: monaco.languages.CompletionItemKind.Function, insertText: 'sum(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Sum of iterable', range },
        { label: 'max', kind: monaco.languages.CompletionItemKind.Function, insertText: 'max(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Maximum value', range },
        { label: 'min', kind: monaco.languages.CompletionItemKind.Function, insertText: 'min(${1:iterable})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Minimum value', range },
        { label: 'abs', kind: monaco.languages.CompletionItemKind.Function, insertText: 'abs(${1:x})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Absolute value', range },
        { label: 'round', kind: monaco.languages.CompletionItemKind.Function, insertText: 'round(${1:number}, ${2:digits})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Round number', range },
        { label: 'type', kind: monaco.languages.CompletionItemKind.Function, insertText: 'type(${1:obj})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Get type', range },
        { label: 'isinstance', kind: monaco.languages.CompletionItemKind.Function, insertText: 'isinstance(${1:obj}, ${2:type})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Check instance', range },
        { label: 'True', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'True', detail: 'Boolean True', range },
        { label: 'False', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'False', detail: 'Boolean False', range },
        { label: 'None', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'None', detail: 'None value', range },
        { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:value}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Return statement', range },
        { label: 'async def', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'async def ${1:function_name}(${2:params}):\n\t${3:pass}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Async function', range },
        { label: 'await', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'await ${1:coroutine}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Await coroutine', range },
        { label: 'list comprehension', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '[${1:expr} for ${2:item} in ${3:iterable}]', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'List comprehension', range },
        { label: 'dict comprehension', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Dict comprehension', range },
      ];

      return { suggestions };
    },
  });

  // Register Java completions
  monaco.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: 'sout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'System.out.println(${1:});', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print to console', range },
        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public static void main(String[] args) {\n\t${1:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main method', range },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public class ${1:ClassName} {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class declaration', range },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop', range },
        { label: 'foreach', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For-each loop', range },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while (${1:condition}) {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop', range },
        { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement', range },
        { label: 'ifelse', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2:}\n} else {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If-else statement', range },
        { label: 'try', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'try {\n\t${1:}\n} catch (${2:Exception} e) {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Try-catch block', range },
        { label: 'method', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'public ${1:void} ${2:methodName}(${3:}) {\n\t${4:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Method declaration', range },
        { label: 'private', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'private ', detail: 'Private modifier', range },
        { label: 'public', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'public ', detail: 'Public modifier', range },
        { label: 'static', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'static ', detail: 'Static modifier', range },
        { label: 'final', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'final ', detail: 'Final modifier', range },
        { label: 'new', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'new ${1:Type}(${2:})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'New instance', range },
        { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'return ${1:};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Return statement', range },
        { label: 'ArrayList', kind: monaco.languages.CompletionItemKind.Class, insertText: 'ArrayList<${1:Type}> ${2:list} = new ArrayList<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'ArrayList declaration', range },
        { label: 'HashMap', kind: monaco.languages.CompletionItemKind.Class, insertText: 'HashMap<${1:Key}, ${2:Value}> ${3:map} = new HashMap<>();', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'HashMap declaration', range },
      ];

      return { suggestions };
    },
  });

  // Register C++ completions
  monaco.languages.registerCompletionItemProvider('cpp', {
    provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: 'cout', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cout << ${1:} << std::endl;', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print to console', range },
        { label: 'cin', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::cin >> ${1:variable};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Read from console', range },
        { label: 'include', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '#include <${1:iostream}>', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Include header', range },
        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'int main() {\n\t${1:}\n\treturn 0;\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main function', range },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop', range },
        { label: 'foreach', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for (auto& ${1:item} : ${2:container}) {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Range-based for', range },
        { label: 'while', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'while (${1:condition}) {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'While loop', range },
        { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if (${1:condition}) {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement', range },
        { label: 'class', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'class ${1:ClassName} {\npublic:\n\t${2:}\nprivate:\n\t${3:}\n};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Class declaration', range },
        { label: 'struct', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'struct ${1:StructName} {\n\t${2:}\n};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Struct declaration', range },
        { label: 'vector', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::vector<${1:int}> ${2:vec};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Vector declaration', range },
        { label: 'string', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::string ${1:str};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'String declaration', range },
        { label: 'map', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'std::map<${1:Key}, ${2:Value}> ${3:m};', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Map declaration', range },
        { label: 'function', kind: monaco.languages.CompletionItemKind.Snippet, insertText: '${1:void} ${2:functionName}(${3:}) {\n\t${4:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Function declaration', range },
        { label: 'nullptr', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'nullptr', detail: 'Null pointer', range },
        { label: 'auto', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'auto ', detail: 'Auto type', range },
        { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'const ', detail: 'Const qualifier', range },
      ];

      return { suggestions };
    },
  });

  // Register Go completions
  monaco.languages.registerCompletionItemProvider('go', {
    provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: 'fmt.Println', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fmt.Println(${1:})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print line', range },
        { label: 'fmt.Printf', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fmt.Printf("${1:%v}\\n", ${2:})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Print formatted', range },
        { label: 'func', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'func ${1:name}(${2:}) ${3:} {\n\t${4:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Function declaration', range },
        { label: 'main', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'func main() {\n\t${1:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Main function', range },
        { label: 'for', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For loop', range },
        { label: 'forrange', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'for ${1:i}, ${2:v} := range ${3:slice} {\n\t${4:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'For range loop', range },
        { label: 'if', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if ${1:condition} {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'If statement', range },
        { label: 'iferr', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'if err != nil {\n\t${1:return err}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Error check', range },
        { label: 'struct', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'type ${1:Name} struct {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Struct declaration', range },
        { label: 'interface', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'type ${1:Name} interface {\n\t${2:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Interface declaration', range },
        { label: 'package', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'package ${1:main}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Package declaration', range },
        { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'import "${1:fmt}"', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Import package', range },
        { label: 'make', kind: monaco.languages.CompletionItemKind.Function, insertText: 'make(${1:[]int}, ${2:0})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Make slice/map/chan', range },
        { label: 'append', kind: monaco.languages.CompletionItemKind.Function, insertText: 'append(${1:slice}, ${2:element})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Append to slice', range },
        { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len(${1:})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Length of slice/map/string', range },
        { label: 'defer', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'defer ${1:}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Defer statement', range },
        { label: 'go', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'go ${1:func()}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Goroutine', range },
        { label: 'chan', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'chan ${1:int}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Channel type', range },
        { label: 'select', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'select {\ncase ${1:}:\n\t${2:}\ndefault:\n\t${3:}\n}', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Select statement', range },
      ];

      return { suggestions };
    },
  });
});

const Editor: React.FC = () => {
  const {
    selectedLanguage,
    userName,
    userColor,
    userId,
    roomId,
    setConnectionStatus,
    setCollaborators,
    setEditorContent,
    theme,
    setPendingLanguageChange,
  } = useApp();

  const editorRef = useRef<any>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const isConnectedRef = useRef(false);
  const lastLanguageChangeRef = useRef<number>(0);

  // Handle awareness changes to track collaborators and language changes
  const handleAwarenessChange = useCallback(() => {
    if (!providerRef.current) return;

    const awareness = providerRef.current.awareness;
    const states = awareness.getStates();
    const users: CollaboratorInfo[] = [];

    states.forEach((state, clientId) => {
      if (state.user && clientId !== awareness.clientID) {
        const collaborator: CollaboratorInfo = {
          clientId,
          user: {
            id: String(clientId),
            name: state.user.name || 'Anonymous',
            color: state.user.color || '#888888',
          },
        };

        // 同步编辑器状态
        if (state.editorState) {
          collaborator.editorMode = state.editorState.mode;
          collaborator.independentContent = state.editorState.content;
          collaborator.independentLanguage = state.editorState.language;
          collaborator.isLocked = state.editorState.isLocked;
        }

        users.push(collaborator);
      }

      // Check for language change notifications from other users
      if (state.languageChange && clientId !== awareness.clientID) {
        const langChange = state.languageChange;
        // Only show notification if it's a new change (based on timestamp)
        if (langChange.timestamp > lastLanguageChangeRef.current && 
            langChange.fromUser.id !== userId) {
          lastLanguageChangeRef.current = langChange.timestamp;
          setPendingLanguageChange({
            type: 'language-change-request',
            fromUser: langChange.fromUser,
            language: langChange.language,
            languageName: langChange.languageName,
          });
        }
      }
    });

    setCollaborators(users);
  }, [setCollaborators, userId, setPendingLanguageChange]);

  // Store current values in refs to avoid stale closures
  const roomIdRef = useRef(roomId);
  const userNameRef = useRef(userName);
  const userColorRef = useRef(userColor);
  const setConnectionStatusRef = useRef(setConnectionStatus);
  const handleAwarenessChangeRef = useRef(handleAwarenessChange);

  // Keep refs updated
  useEffect(() => {
    roomIdRef.current = roomId;
    userNameRef.current = userName;
    userColorRef.current = userColor;
    setConnectionStatusRef.current = setConnectionStatus;
    handleAwarenessChangeRef.current = handleAwarenessChange;
  }, [roomId, userName, userColor, setConnectionStatus, handleAwarenessChange]);

  const handleEditorDidMount = useCallback((editor: any, _monaco: any) => {
    editorRef.current = editor;
    editor.focus();

    // Update editor content in context
    editor.onDidChangeModelContent(() => {
      setEditorContent(editor.getValue());
    });

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      window.dispatchEvent(new CustomEvent('cocode-cursor-change', {
        detail: {
          line: e.position.lineNumber,
          column: e.position.column,
        }
      }));
    });

    // Only setup WebSocket connection once
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId || isConnectedRef.current) return;
    isConnectedRef.current = true;

    // Initialize Yjs document
    const doc = new Y.Doc();
    docRef.current = doc;
    const type = doc.getText('monaco');

    // Connect to WebSocket server
    // Auto-detect WebSocket URL based on current host
    const getWsUrl = () => {
      const host = window.location.hostname;
      const isSecure = window.location.protocol === 'https:';
      
      // If accessing via IP directly, use ws:// with port 1234
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        return `ws://${host}:1234`;
      }
      
      // If accessing via domain with HTTPS, use wss:// with /ws path (proxied by Nginx)
      if (isSecure) {
        return `wss://${host}/ws`;
      }
      
      // Fallback to environment variable or localhost
      return import.meta.env.VITE_WS_URL || 'ws://localhost:1234';
    };
    
    const wsUrl = getWsUrl();
    console.log(`Connecting to WebSocket: ${wsUrl}/${currentRoomId}`);
    const provider = new WebsocketProvider(wsUrl, currentRoomId, doc);
    providerRef.current = provider;
    
    // Store provider reference globally for broadcasting
    setWsProvider(provider);

    // Connection status listeners
    provider.on('status', (event: { status: string }) => {
      console.log('WebSocket status:', event.status);
      setConnectionStatusRef.current(event.status === 'connected' ? 'connected' : 'disconnected');
    });

    provider.on('sync', (isSynced: boolean) => {
      console.log('WebSocket sync:', isSynced);
      if (isSynced) {
        setConnectionStatusRef.current('connected');
      }
    });

    setConnectionStatusRef.current('connecting');

    // Create Monaco binding
    const binding = new MonacoBinding(
      type,
      editor.getModel()!,
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;

    // Set user awareness
    provider.awareness.setLocalStateField('user', {
      name: userNameRef.current,
      color: userColorRef.current,
    });

    // Track collaborators
    provider.awareness.on('change', () => handleAwarenessChangeRef.current());
    handleAwarenessChangeRef.current();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setEditorContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setWsProvider(null);
      isConnectedRef.current = false;
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
      docRef.current?.destroy();
    };
  }, []);

  // Update user name in awareness when it changes
  useEffect(() => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
      });
    }
  }, [userName, userColor]);

  const defaultCode = CODE_TEMPLATES[selectedLanguage.id] || '// Start coding...';

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        language={selectedLanguage.monacoId}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        defaultValue={defaultCode}
        onMount={handleEditorDidMount}
        options={{
          // Basic settings
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16 },
          
          // Cursor and scrolling
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          
          // Font settings
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          
          // IntelliSense & Autocomplete
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'allDocuments',
          suggestSelection: 'first',
          
          // Parameter hints
          parameterHints: {
            enabled: true,
            cycle: true,
          },
          
          // Bracket matching and guides
          bracketPairColorization: {
            enabled: true,
            independentColorPoolPerBracketType: true,
          },
          guides: {
            bracketPairs: true,
            bracketPairsHorizontal: true,
            highlightActiveBracketPair: true,
            indentation: true,
            highlightActiveIndentation: true,
          },
          matchBrackets: 'always',
          
          // Code folding
          folding: true,
          foldingStrategy: 'indentation',
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          
          // Auto formatting
          formatOnType: true,
          formatOnPaste: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoClosingOvertype: 'always',
          autoSurround: 'languageDefined',
          autoIndent: 'full',
          
          // Code lens and inlay hints
          codeLens: true,
          inlayHints: {
            enabled: 'on',
          },
          
          // Hover and documentation
          hover: {
            enabled: true,
            delay: 300,
          },
          
          // Error and diagnostics
          renderValidationDecorations: 'on',
          
          // Minimap settings
          minimap: {
            enabled: true,
            maxColumn: 80,
            renderCharacters: false,
            showSlider: 'mouseover',
          },
          
          // Selection and highlights
          selectionHighlight: true,
          occurrencesHighlight: 'singleFile',
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',
          
          // Scrollbar
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
          
          // Other useful features
          linkedEditing: true,
          renameOnType: true,
          snippetSuggestions: 'top',
          suggest: {
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true,
            insertMode: 'insert',
            filterGraceful: true,
            snippetsPreventQuickSuggestions: false,
            localityBonus: true,
            shareSuggestSelections: true,
            showIcons: true,
            preview: true,
            previewMode: 'prefix',
          },
        }}
      />
    </div>
  );
};

export default Editor;

