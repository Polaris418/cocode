import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useI18n } from './i18n';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import Console from './components/Console';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import StatusBar from './components/StatusBar';
import { ToastContainer, showToast } from './components/Toast';
import { executeCode } from './hooks/useCodeExecution';
import { LanguageNotification, LanguageChangedNotification } from './components/LanguageNotification';
import { CollaboratorPanel } from './components/CollaboratorPanel';
import { IndependentEditor, CollaboratorEditor, PanelState } from './components/SplitView';
import { ResizableDivider } from './components/ResizableDivider';
import { ProgrammingLanguage, User, CollaboratorInfo } from './types';

const AppContent: React.FC = () => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    editorContent,
    showConsole,
    setShowConsole,
    toggleConsole,
    setConsoleOutput,
    setIsExecuting,
    collaborators,
    userId,
    userName,
    userColor,
    splitViewMode,
    setSplitViewMode,
    followingUserId,
    setFollowingUserId,
    pendingLanguageChange,
    setPendingLanguageChange,
    showCollaboratorPanel,
    setShowCollaboratorPanel,
    theme,
    editorMode,
    setEditorMode,
    independentContent,
    setIndependentContent,
    independentLanguage,
    setIndependentLanguage,
    broadcastLanguageChange,
    broadcastEditorState,
    sharedEditorCount,
    maxSharedEditors,
    isEditorLocked,
    setIsEditorLocked,
  } = useApp();

  const { t } = useI18n();

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Language change notification state
  const [languageChangedInfo, setLanguageChangedInfo] = useState<{
    show: boolean;
    user: User;
    languageName: string;
  } | null>(null);

  // Editor stats for status bar
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Handle cursor position updates from Editor
  useEffect(() => {
    const handleCursorChange = (e: CustomEvent<{ line: number; column: number }>) => {
      setCursorPosition(e.detail);
    };
    window.addEventListener('cocode-cursor-change' as any, handleCursorChange);
    return () => window.removeEventListener('cocode-cursor-change' as any, handleCursorChange);
  }, []);

  // Run code handler
  const handleRunCode = useCallback(async () => {
    setShowConsole(true);
    setIsExecuting(true);
    setConsoleOutput(`${t.executing}\n`);

    try {
      const result = await executeCode({
        language: selectedLanguage.id,
        code: editorContent,
      });

      let output = '';

      if (result.stdout) {
        output += `${t.output}:\n${result.stdout}\n`;
      }

      if (result.stderr) {
        output += `${t.stderr}:\n${result.stderr}\n`;
      }

      if (result.error) {
        output += `${t.error}:\n${result.error}\n`;
      }

      output += `\n${t.exitCode}: ${result.exitCode}`;

      setConsoleOutput(output);
      
      if (result.exitCode === 0) {
        showToast(t.executionSuccess, 'success');
      } else {
        showToast(t.executionError, 'error');
      }
    } catch (error: any) {
      setConsoleOutput(`${t.error}: ${error.message}`);
      showToast(t.executionFailed, 'error');
    } finally {
      setIsExecuting(false);
    }
  }, [selectedLanguage.id, editorContent, setShowConsole, setIsExecuting, setConsoleOutput, t]);

  // Handle language change request and broadcast to other users
  const handleLanguageChangeRequest = useCallback((lang: ProgrammingLanguage) => {
    setSelectedLanguage(lang);
    // Broadcast language change to other collaborators
    broadcastLanguageChange(lang);
    showToast(`${t.language}: ${lang.name}`, 'info');
  }, [setSelectedLanguage, broadcastLanguageChange, t]);

  // Handle accepting language change from another user
  const handleAcceptLanguageChange = useCallback(() => {
    if (pendingLanguageChange) {
      const lang = { 
        id: pendingLanguageChange.language, 
        name: pendingLanguageChange.languageName,
        monacoId: pendingLanguageChange.language,
        icon: '📄'
      };
      setSelectedLanguage(lang as ProgrammingLanguage);
      setPendingLanguageChange(null);
      showToast(`${t.language}: ${pendingLanguageChange.languageName}`, 'success');
    }
  }, [pendingLanguageChange, setSelectedLanguage, setPendingLanguageChange, t]);

  // Handle declining language change
  const handleDeclineLanguageChange = useCallback(() => {
    setPendingLanguageChange(null);
  }, [setPendingLanguageChange]);

  // Handle viewing a collaborator's code
  const handleViewCollaborator = useCallback((_collaborator: CollaboratorInfo) => {
    if (splitViewMode === 'single') {
      setSplitViewMode('vertical');
    }
  }, [splitViewMode, setSplitViewMode]);

  // Handle following a collaborator
  const handleFollowCollaborator = useCallback((collaborator: CollaboratorInfo) => {
    if (followingUserId === collaborator.clientId) {
      setFollowingUserId(null);
    } else {
      setFollowingUserId(collaborator.clientId);
      if (splitViewMode === 'single') {
        setSplitViewMode('vertical');
      }
    }
  }, [followingUserId, setFollowingUserId, splitViewMode, setSplitViewMode]);

  // Keyboard shortcuts handler
  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey && e.key === 'Enter') || e.key === 'F5') {
      e.preventDefault();
      handleRunCode();
      showToast(t.executing, 'info');
    }
    else if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      toggleConsole();
    }
    else if (e.ctrlKey && e.key === ',') {
      e.preventDefault();
      setShowSettings(true);
    }
    else if (e.key === 'F1') {
      e.preventDefault();
      setShowHelp(true);
    }
    else if (e.key === 'Escape') {
      setShowSettings(false);
      setShowHelp(false);
      setPendingLanguageChange(null);
    }
    else if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      setShowCollaboratorPanel(!showCollaboratorPanel);
    }
  }, [toggleConsole, handleRunCode, showCollaboratorPanel, setShowCollaboratorPanel, setPendingLanguageChange, t]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => {
    const handleRunEvent = () => handleRunCode();
    window.addEventListener('cocode-run-code', handleRunEvent);
    return () => window.removeEventListener('cocode-run-code', handleRunEvent);
  }, [handleRunCode]);

  // Get other collaborators for split view
  const otherCollaborators = collaborators.filter(c => c.user.id !== userId);

  // 处理编辑器模式切换
  const handleEditorModeChange = useCallback((newMode: 'shared' | 'independent') => {
    // 检查是否可以切换到共享模式（最多2个共享编辑器）
    if (newMode === 'shared' && sharedEditorCount >= maxSharedEditors) {
      showToast(t.maxSharedEditorsReached || '已达到共享编辑器数量上限', 'warning');
      return;
    }
    setEditorMode(newMode);
    // 广播状态变更
    setTimeout(() => broadcastEditorState(), 100);
  }, [setEditorMode, broadcastEditorState, sharedEditorCount, maxSharedEditors, t]);

  // 处理锁定状态切换
  const handleLockToggle = useCallback(() => {
    setIsEditorLocked(!isEditorLocked);
    // 广播状态变更
    setTimeout(() => broadcastEditorState(), 100);
    showToast(isEditorLocked ? t.unlock : t.lock, 'info');
  }, [isEditorLocked, setIsEditorLocked, broadcastEditorState, t]);

  // 当独立内容或语言变化时广播状态
  useEffect(() => {
    if (editorMode === 'independent') {
      broadcastEditorState();
    }
  }, [editorMode, independentContent, independentLanguage, broadcastEditorState]);

  // 判断是否显示分屏 - 有协作者或者处于独立模式都显示分屏
  const showSplitView = splitViewMode !== 'single' && (otherCollaborators.length > 0 || editorMode === 'independent');
  const isHorizontal = splitViewMode === 'horizontal';

  // 面板状态管理
  const [panelStates, setPanelStates] = useState<Record<string, PanelState>>({});
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);

  // 面板尺寸管理（百分比）
  const [panelSizes, setPanelSizes] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理面板调整大小
  const handlePanelResize = useCallback((panelId: string, delta: number, isHorizontal: boolean) => {
    if (!containerRef.current) return;
    
    const containerSize = isHorizontal 
      ? containerRef.current.offsetWidth 
      : containerRef.current.offsetHeight;
    
    const deltaPercent = (delta / containerSize) * 100;
    
    setPanelSizes(prev => {
      const currentSize = prev[panelId] ?? 50; // 默认 50%
      const newSize = Math.max(15, Math.min(85, currentSize + deltaPercent)); // 限制在 15%-85%
      return { ...prev, [panelId]: newSize };
    });
  }, []);

  // 处理面板状态变化
  const handlePanelStateChange = useCallback((panelId: string, newState: PanelState) => {
    if (newState === 'maximized') {
      setMaximizedPanel(panelId);
      setPanelStates(prev => ({ ...prev, [panelId]: 'maximized' }));
    } else if (newState === 'normal') {
      setMaximizedPanel(null);
      setPanelStates(prev => ({ ...prev, [panelId]: 'normal' }));
    } else {
      setPanelStates(prev => ({ ...prev, [panelId]: newState }));
      if (maximizedPanel === panelId) {
        setMaximizedPanel(null);
      }
    }
  }, [maximizedPanel]);


  // 获取隐藏的面板列表
  const hiddenPanels = useMemo(() => {
    const hidden: { id: string; name: string }[] = [];
    if (panelStates['main'] === 'hidden') {
      hidden.push({ id: 'main', name: t.myEditor });
    }
    if (editorMode === 'independent' && panelStates['independent'] === 'hidden') {
      hidden.push({ id: 'independent', name: t.independentEditor });
    }
    otherCollaborators.forEach(collab => {
      if (panelStates[collab.clientId.toString()] === 'hidden') {
        hidden.push({ id: collab.clientId.toString(), name: `${collab.user.name}${t.theirEditor}` });
      }
    });
    return hidden;
  }, [panelStates, editorMode, otherCollaborators, t]);

  // 恢复隐藏的面板
  const restorePanel = useCallback((panelId: string) => {
    setPanelStates(prev => ({ ...prev, [panelId]: 'normal' }));
    setShowHiddenMenu(false);
  }, []);

  // 获取面板的样式类
  const getPanelClass = useCallback((panelId: string, baseClass: string) => {
    const state = panelStates[panelId] || 'normal';
    if (state === 'hidden') return 'hidden';
    if (maximizedPanel && maximizedPanel !== panelId) return 'hidden';
    if (state === 'minimized') return 'h-10 flex-shrink-0';
    if (maximizedPanel === panelId) return 'flex-1';
    return baseClass;
  }, [panelStates, maximizedPanel]);

  return (
    <div className="flex flex-col h-screen bg-editor-bg">
      {/* Header Toolbar */}
      <Toolbar 
        onRunCode={handleRunCode} 
        onOpenSettings={() => setShowSettings(true)}
        onOpenHelp={() => setShowHelp(true)}
        onLanguageChangeRequest={handleLanguageChangeRequest}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collaborator Panel (left sidebar) */}
        {showCollaboratorPanel && (
          <div className="w-64 border-r border-editor-border p-2 overflow-y-auto bg-editor-sidebar">
            <CollaboratorPanel
              collaborators={collaborators}
              currentUserId={userId}
              currentUserName={userName}
              currentUserColor={userColor}
              currentLanguage={selectedLanguage.name}
              onViewCollaborator={handleViewCollaborator}
              onFollowCollaborator={handleFollowCollaborator}
              followingId={followingUserId ?? undefined}
              splitViewMode={splitViewMode}
            />
          </div>
        )}

        {/* Editor & Console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Hidden Panels Menu */}
          {hiddenPanels.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowHiddenMenu(!showHiddenMenu)}
                className="absolute top-1 right-1 z-10 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span>{t.hiddenPanels} ({hiddenPanels.length})</span>
              </button>
              
              {showHiddenMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowHiddenMenu(false)} />
                  <div className="absolute top-8 right-1 z-20 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 min-w-[150px]">
                    {hiddenPanels.map(panel => (
                      <button
                        key={panel.id}
                        onClick={() => restorePanel(panel.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{t.showPanel}: {panel.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Editor with Split View - Editor 始终保持在同一位置，避免重新挂载 */}
          <div className={`transition-all duration-200 ${showConsole ? 'h-2/3' : 'h-full'}`}>
            <div 
              ref={containerRef}
              className={`h-full ${showSplitView ? (isHorizontal ? 'flex flex-row' : 'flex flex-col') : ''}`}
            >
              {/* Main Editor Container - 始终渲染，CSS 控制样式 */}
              <div 
                className={panelStates['main'] === 'hidden' ? 'hidden' : (
                  maximizedPanel === 'main' ? 'flex-1' : (
                    panelStates['main'] === 'minimized' ? 'h-10 flex-shrink-0' : (
                      showSplitView ? (isHorizontal ? 'min-w-0' : 'min-h-0') : 'h-full'
                    )
                  )
                )}
                style={showSplitView && !maximizedPanel && panelStates['main'] !== 'minimized' && panelStates['main'] !== 'hidden' ? {
                  [isHorizontal ? 'width' : 'height']: `${panelSizes['main'] ?? 50}%`,
                  flexShrink: 0,
                } : undefined}
              >
                <div className={`h-full ${showSplitView ? 'border border-green-600/30 rounded-lg overflow-hidden' : ''}`}>
                  {/* 分屏模式下的标题栏 */}
                  {showSplitView && (
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-green-500">
                      <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t.myEditor}
                        <span className="text-xs text-gray-500">({editorMode === 'shared' ? t.shared : t.independent})</span>
                        {isEditorLocked && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {t.locked}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* 锁定按钮 */}
                        <button
                          onClick={handleLockToggle}
                          className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                            isEditorLocked
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                          title={isEditorLocked ? t.unlock : t.lock}
                        >
                          {isEditorLocked ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          )}
                          <span>{isEditorLocked ? t.unlock : t.lock}</span>
                        </button>
                        
                        {/* 模式切换按钮 */}
                        <button
                          onClick={() => handleEditorModeChange(editorMode === 'shared' ? 'independent' : 'shared')}
                          className={`px-2 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                            editorMode === 'independent'
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                          title={editorMode === 'independent' ? t.switchToShared : t.switchToIndependent}
                        >
                          {editorMode === 'independent' ? (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            </>
                          )}
                        </button>
                        
                        {/* 面板控制按钮 */}
                        <div className="flex items-center gap-1">
                          {panelStates['main'] === 'minimized' ? (
                            <button
                              onClick={() => handlePanelStateChange('main', 'normal')}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title={t.restore}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePanelStateChange('main', 'minimized')}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title={t.minimize}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                          )}
                          {maximizedPanel === 'main' ? (
                            <button
                              onClick={() => handlePanelStateChange('main', 'normal')}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title={t.restore}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePanelStateChange('main', 'maximized')}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title={t.maximize}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handlePanelStateChange('main', 'hidden')}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                            title={t.hidePanel}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Editor 始终在这里，高度根据是否有标题栏调整 */}
                  <div className={showSplitView && panelStates['main'] !== 'minimized' ? 'h-[calc(100%-40px)]' : (panelStates['main'] === 'minimized' ? 'hidden' : 'h-full')}>
                    <Editor />
                  </div>
                </div>
              </div>

              {/* 主编辑器后面的分隔条 */}
              {showSplitView && !maximizedPanel && panelStates['main'] !== 'hidden' && panelStates['main'] !== 'minimized' && (
                <ResizableDivider
                  direction={isHorizontal ? 'horizontal' : 'vertical'}
                  onResize={(delta) => handlePanelResize('main', delta, isHorizontal)}
                />
              )}

              {/* 分屏模式下的其他编辑器 - 显示所有协作者 */}
              {showSplitView && !maximizedPanel && (
                <>
                  {editorMode === 'independent' && panelStates['independent'] !== 'hidden' && (
                    // 独立模式 - 显示独立编辑器
                    <div className={getPanelClass('independent', isHorizontal ? 'flex-1 min-w-0' : 'flex-1 min-h-0')}>
                      <IndependentEditor
                        content={independentContent}
                        language={independentLanguage}
                        theme={theme}
                        onContentChange={setIndependentContent}
                        onLanguageChange={setIndependentLanguage}
                        onModeChange={handleEditorModeChange}
                        panelState={panelStates['independent'] || 'normal'}
                        onPanelStateChange={(state) => handlePanelStateChange('independent', state)}
                      />
                    </div>
                  )}
                  
                  {/* 显示其他协作者的编辑器 */}
                  {otherCollaborators.map((collab) => {
                    const panelId = collab.clientId.toString();
                    if (panelStates[panelId] === 'hidden') return null;
                    return (
                      <div key={collab.clientId} className={getPanelClass(panelId, isHorizontal ? 'flex-1 min-w-0' : 'flex-1 min-h-0')}>
                        <CollaboratorEditor
                          collaborator={collab}
                          content={editorContent}
                          language={selectedLanguage.monacoId}
                          theme={theme}
                          isFollowing={followingUserId === collab.clientId}
                          onFollow={() => handleFollowCollaborator(collab)}
                          onUnfollow={() => setFollowingUserId(null)}
                          panelState={panelStates[panelId] || 'normal'}
                          onPanelStateChange={(state) => handlePanelStateChange(panelId, state)}
                        />
                      </div>
                    );
                  })}
                  
                  {/* 如果没有协作者且不在独立模式 */}
                  {otherCollaborators.length === 0 && editorMode !== 'independent' && (
                    <div className="flex flex-col h-full border border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center px-3 py-2 bg-gray-800 border-b border-gray-700 border-t-2 border-t-gray-500">
                        <span className="text-sm text-gray-400 font-medium">{t.noCollaborators}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-gray-900">
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-sm">{t.noCollaborators}</p>
                          <p className="text-xs mt-1">{t.share}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Console */}
          {showConsole && (
            <div className="h-1/3 border-t border-editor-border">
              <Console />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar cursorPosition={cursorPosition} />

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Language Change Notification */}
      {pendingLanguageChange && (
        <LanguageNotification
          show={true}
          fromUser={pendingLanguageChange.fromUser}
          languageName={pendingLanguageChange.languageName}
          onAccept={handleAcceptLanguageChange}
          onDecline={handleDeclineLanguageChange}
        />
      )}

      {/* Language Changed Notification */}
      {languageChangedInfo && (
        <LanguageChangedNotification
          show={languageChangedInfo.show}
          fromUser={languageChangedInfo.user}
          languageName={languageChangedInfo.languageName}
          onClose={() => setLanguageChangedInfo(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

