import React, { useRef, useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useI18n } from '../i18n';
import { CollaboratorInfo, SplitViewMode, EditorMode, ProgrammingLanguage } from '../types';
import { SUPPORTED_LANGUAGES, CODE_TEMPLATES } from '../constants';
import { useCodeExecution } from '../hooks/useCodeExecution';

// Mini Console Component - 迷你控制台组件
interface MiniConsoleProps {
  output: string;
  onClear: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const MiniConsole: React.FC<MiniConsoleProps> = ({ output, onClear, isExpanded, onToggle }) => {
  const { t } = useI18n();
  
  return (
    <div className={`border-t border-gray-700 bg-gray-900 transition-all ${isExpanded ? 'h-32' : 'h-8'}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-800 border-b border-gray-700 h-8">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span>📟</span>
          <span>{t.console}</span>
        </button>
        {isExpanded && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-1"
            title={t.clear}
          >
            🗑️
          </button>
        )}
      </div>
      
      {/* Console Content */}
      {isExpanded && (
        <div className="h-[calc(100%-32px)] overflow-auto p-2 font-mono">
          {output ? (
            <pre className="text-gray-300 text-xs whitespace-pre-wrap leading-relaxed">
              {output}
            </pre>
          ) : (
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <span>💡</span>
              <span>{t.noOutput}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Panel Control Buttons - 面板控制按钮组件
interface PanelControlsProps {
  isMinimized: boolean;
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onRestore: () => void;
  onHide: () => void;
  showHide?: boolean;
}

const PanelControls: React.FC<PanelControlsProps> = ({
  isMinimized,
  isMaximized,
  onMinimize,
  onMaximize,
  onRestore,
  onHide,
  showHide = true,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-1">
      {/* Minimize/Restore */}
      {isMinimized ? (
        <button
          onClick={onRestore}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={t.restore}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onMinimize}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={t.minimize}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      )}
      
      {/* Maximize/Restore */}
      {isMaximized ? (
        <button
          onClick={onRestore}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={t.restore}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onMaximize}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={t.maximize}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      )}
      
      {/* Hide */}
      {showHide && (
        <button
          onClick={onHide}
          className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          title={t.hidePanel}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Panel state type
export type PanelState = 'normal' | 'minimized' | 'maximized' | 'hidden';

interface CollaboratorEditorProps {
  collaborator: CollaboratorInfo;
  content: string;
  language: string;
  theme: string;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  panelState?: PanelState;
  onPanelStateChange?: (state: PanelState) => void;
}

export const CollaboratorEditor: React.FC<CollaboratorEditorProps> = ({
  collaborator,
  content,
  language,
  theme,
  isFollowing,
  onFollow,
  onUnfollow,
  panelState = 'normal',
  onPanelStateChange,
}) => {
  const { t } = useI18n();
  const editorRef = useRef<any>(null);
  const { isExecuting, output, execute, clearOutput } = useCodeExecution();
  const [showConsole, setShowConsole] = useState(false);

  // 判断协作者是否在独立模式
  const isIndependent = collaborator.editorMode === 'independent';
  // 显示的内容：独立模式显示独立内容，共享模式显示共享内容
  const displayContent = isIndependent && collaborator.independentContent 
    ? collaborator.independentContent 
    : content;
  // 显示的语言：独立模式显示独立语言，共享模式显示共享语言
  const displayLanguage = isIndependent && collaborator.independentLanguage 
    ? collaborator.independentLanguage 
    : language;

  // Scroll to collaborator's cursor position
  useEffect(() => {
    if (editorRef.current && collaborator.cursor && isFollowing) {
      editorRef.current.revealLineInCenter(collaborator.cursor.lineNumber);
    }
  }, [collaborator.cursor, isFollowing]);

  const handleRun = async () => {
    setShowConsole(true);
    await execute(displayLanguage, displayContent);
  };

  // 边框颜色：独立模式紫色，共享模式使用用户颜色
  const borderColor = isIndependent ? '#9333ea' : collaborator.user.color;

  const isMinimized = panelState === 'minimized';
  const isMaximized = panelState === 'maximized';
  
  // 判断协作者编辑器是否被锁定
  const isLockedByCollaborator = collaborator.isLocked === true;
  const topBorderColor = isLockedByCollaborator ? '#dc2626' : borderColor;

  // 最小化时只显示标题栏
  if (isMinimized) {
    return (
      <div className="flex flex-col border border-gray-700 rounded-lg overflow-hidden h-10">
        <div 
          className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700"
          style={{ borderTopColor: topBorderColor, borderTopWidth: '2px' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: collaborator.user.color }}
            >
              {collaborator.user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-300 font-medium truncate max-w-[100px]">
              {collaborator.user.name}
            </span>
            <span className={`text-xs px-1 py-0.5 rounded ${
              isIndependent 
                ? 'bg-purple-600/30 text-purple-300' 
                : 'bg-green-600/30 text-green-300'
            }`}>
              {isIndependent ? t.independent : t.shared}
            </span>
            {isLockedByCollaborator && (
              <span className="text-xs px-1 py-0.5 bg-red-600/30 text-red-300 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
            )}
          </div>
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700"
        style={{ borderTopColor: topBorderColor, borderTopWidth: '2px' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: collaborator.user.color }}
          >
            {collaborator.user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-200 font-medium">
            {collaborator.user.name}{t.theirEditor}
          </span>
          {/* 显示模式标签 */}
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            isIndependent 
              ? 'bg-purple-600/30 text-purple-300' 
              : 'bg-green-600/30 text-green-300'
          }`}>
            {isIndependent ? t.independent : t.shared}
          </span>
          {/* 显示锁定状态 */}
          {isLockedByCollaborator && (
            <span className="text-xs px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t.locked || t.lockedByUser}
            </span>
          )}
          {collaborator.cursor && (
            <span className="text-xs text-gray-500 ml-2">
              {t.line} {collaborator.cursor.lineNumber}, {t.column} {collaborator.cursor.column}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              isExecuting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={t.run}
          >
            {isExecuting ? (
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {isFollowing ? (
            <button
              onClick={onUnfollow}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
              title={t.stopFollowing}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={onFollow}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center gap-1"
              title={t.follow}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          
          {/* Panel Controls */}
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
      
      {/* Editor (read-only) */}
      <div className={showConsole ? 'flex-1 min-h-0' : 'flex-1'}>
        <MonacoEditor
          height="100%"
          language={displayLanguage}
          value={displayContent}
          theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'hc-black'}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            wordWrap: 'on',
            automaticLayout: true,
            domReadOnly: true,
            cursorStyle: 'line',
            renderLineHighlight: 'none',
          }}
        />
      </div>
      
      {/* Mini Console */}
      <MiniConsole
        output={output}
        onClear={clearOutput}
        isExpanded={showConsole}
        onToggle={() => setShowConsole(!showConsole)}
      />
    </div>
  );
};

// Shared View Editor - 共享视图编辑器，显示共享内容（只读镜像）
interface SharedViewEditorProps {
  content: string;
  language: string;
  theme: string;
  onModeChange: (mode: EditorMode) => void;
  panelState?: PanelState;
  onPanelStateChange?: (state: PanelState) => void;
}

export const SharedViewEditor: React.FC<SharedViewEditorProps> = ({
  content,
  language,
  theme,
  onModeChange,
  panelState = 'normal',
  onPanelStateChange,
}) => {
  const { t } = useI18n();
  const editorRef = useRef<any>(null);
  const { isExecuting, output, execute, clearOutput } = useCodeExecution();
  const [showConsole, setShowConsole] = useState(false);

  const handleRun = async () => {
    setShowConsole(true);
    await execute(language, content);
  };

  const isMinimized = panelState === 'minimized';
  const isMaximized = panelState === 'maximized';

  // 最小化时只显示标题栏
  if (isMinimized) {
    return (
      <div className="flex flex-col border border-blue-600/30 rounded-lg overflow-hidden h-10">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-blue-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-300 font-medium">{t.sharedView}</span>
          </div>
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-blue-600/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-blue-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-200 font-medium">{t.sharedView}</span>
          <span className="text-xs text-gray-500">({t.readOnly})</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              isExecuting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={t.run}
          >
            {isExecuting ? (
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {/* Mode toggle - 切换到独立模式 */}
          <button
            onClick={() => onModeChange('independent')}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center gap-1"
            title={t.switchToIndependent}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </button>
          
          {/* Panel Controls */}
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
      
      {/* Editor (read-only mirror of shared content) */}
      <div className={showConsole ? 'flex-1 min-h-0' : 'flex-1'}>
        <MonacoEditor
          height="100%"
          language={language}
          value={content}
          theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'hc-black'}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            wordWrap: 'on',
            automaticLayout: true,
            domReadOnly: true,
            cursorStyle: 'line',
            renderLineHighlight: 'none',
            padding: { top: 8 },
          }}
        />
      </div>
      
      {/* Mini Console */}
      <MiniConsole
        output={output}
        onClear={clearOutput}
        isExpanded={showConsole}
        onToggle={() => setShowConsole(!showConsole)}
      />
    </div>
  );
};

// Independent Editor - 独立编辑器，可以有自己的内容和语言
interface IndependentEditorProps {
  content: string;
  language: ProgrammingLanguage;
  theme: string;
  onContentChange: (content: string) => void;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  onModeChange: (mode: EditorMode) => void;
  panelState?: PanelState;
  onPanelStateChange?: (state: PanelState) => void;
}

export const IndependentEditor: React.FC<IndependentEditorProps> = ({
  content,
  language,
  theme,
  onContentChange,
  onLanguageChange,
  onModeChange,
  panelState = 'normal',
  onPanelStateChange,
}) => {
  const { t } = useI18n();
  const editorRef = useRef<any>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { isExecuting, output, execute, clearOutput } = useCodeExecution();
  const [showConsole, setShowConsole] = useState(false);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      onContentChange(editor.getValue());
    });
  };

  const handleRun = async () => {
    setShowConsole(true);
    const codeToRun = editorRef.current?.getValue() || content || defaultCode;
    await execute(language.id, codeToRun);
  };

  const defaultCode = CODE_TEMPLATES[language.id] || '// Start coding...';
  const isMinimized = panelState === 'minimized';
  const isMaximized = panelState === 'maximized';

  // 最小化时只显示标题栏
  if (isMinimized) {
    return (
      <div className="flex flex-col border border-purple-600/30 rounded-lg overflow-hidden h-10">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-purple-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-300 font-medium">{t.independentEditor}</span>
          </div>
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-purple-600/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-purple-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-gray-200 font-medium">{t.independentEditor}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
              isExecuting
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={t.run}
          >
            {isExecuting ? (
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            <span className="hidden sm:inline">{t.run}</span>
          </button>
          
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center gap-1"
            >
              <span>{language.icon}</span>
              <span>{language.name}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLangMenu(false)} />
                <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 py-1 min-w-[120px] max-h-48 overflow-y-auto">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        onLanguageChange(lang);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                        language.id === lang.id
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Mode toggle - 切换回共享模式 */}
          <button
            onClick={() => onModeChange('shared')}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex items-center gap-1"
            title={t.switchToShared}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          
          {/* Panel Controls */}
          {onPanelStateChange && (
            <PanelControls
              isMinimized={isMinimized}
              isMaximized={isMaximized}
              onMinimize={() => onPanelStateChange('minimized')}
              onMaximize={() => onPanelStateChange('maximized')}
              onRestore={() => onPanelStateChange('normal')}
              onHide={() => onPanelStateChange('hidden')}
            />
          )}
        </div>
      </div>
      
      {/* Editor */}
      <div className={showConsole ? 'flex-1 min-h-0' : 'flex-1'}>
        <MonacoEditor
          height="100%"
          language={language.monacoId}
          value={content || defaultCode}
          theme={theme === 'dark' ? 'vs-dark' : theme === 'light' ? 'vs' : 'hc-black'}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 8 },
          }}
        />
      </div>
      
      {/* Mini Console */}
      <MiniConsole
        output={output}
        onClear={clearOutput}
        isExpanded={showConsole}
        onToggle={() => setShowConsole(!showConsole)}
      />
    </div>
  );
};

interface SplitViewContainerProps {
  mode: SplitViewMode;
  mainEditor: React.ReactNode;
  collaboratorEditors: React.ReactNode[];
}

export const SplitViewContainer: React.FC<SplitViewContainerProps> = ({
  mode,
  mainEditor,
  collaboratorEditors,
}) => {
  const { t } = useI18n();

  // 使用 CSS 控制显示而不是条件渲染，避免 Editor 重新挂载
  const isSingleMode = mode === 'single' || collaboratorEditors.length === 0;
  
  const containerClass = mode === 'horizontal' 
    ? 'flex flex-row h-full gap-1' 
    : 'flex flex-col h-full gap-1';

  // 单屏模式：直接显示主编辑器
  if (isSingleMode) {
    return <div className="h-full">{mainEditor}</div>;
  }

  // 分屏模式：使用稳定的容器结构
  return (
    <div className={containerClass}>
      {/* Main Editor - 始终保持挂载 */}
      <div className={mode === 'horizontal' ? 'flex-1 min-w-0' : 'flex-1 min-h-0'}>
        <div className="h-full border border-green-600/30 rounded-lg overflow-hidden">
          <div className="flex items-center px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-green-500">
            <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t.myEditor}
            </span>
          </div>
          <div className="h-[calc(100%-40px)]">
            {mainEditor}
          </div>
        </div>
      </div>
      
      {/* Collaborator Editors */}
      {collaboratorEditors.map((editor, index) => (
        <div 
          key={index} 
          className={mode === 'horizontal' ? 'flex-1 min-w-0' : 'flex-1 min-h-0'}
        >
          {editor}
        </div>
      ))}
    </div>
  );
};

// Split View Mode Selector
interface SplitViewSelectorProps {
  mode: SplitViewMode;
  onChange: (mode: SplitViewMode) => void;
  disabled?: boolean;
}

export const SplitViewSelector: React.FC<SplitViewSelectorProps> = ({
  mode,
  onChange,
  disabled = false,
}) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const options: { value: SplitViewMode; label: string; icon: React.ReactNode }[] = [
    {
      value: 'single',
      label: t.singleView,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
        </svg>
      ),
    },
    {
      value: 'vertical',
      label: t.verticalSplit,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <line x1="12" y1="3" x2="12" y2="21" strokeWidth={2} />
        </svg>
      ),
    },
    {
      value: 'horizontal',
      label: t.horizontalSplit,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth={2} />
        </svg>
      ),
    },
  ];

  const currentOption = options.find(o => o.value === mode) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
          disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
        title={t.splitViewMode}
      >
        {currentOption.icon}
        <span className="hidden sm:inline">{t.splitView}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 py-1 min-w-[150px]">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  mode === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
