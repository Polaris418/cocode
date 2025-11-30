import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';
import { SUPPORTED_LANGUAGES } from '../constants';
import { SplitViewSelector } from './SplitView';
import { CollaboratorAvatars } from './CollaboratorPanel';
import { ProgrammingLanguage } from '../types';
import { showToast } from './Toast';

interface ToolbarProps {
  onRunCode: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onLanguageChangeRequest?: (lang: ProgrammingLanguage) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onRunCode, onOpenSettings, onOpenHelp, onLanguageChangeRequest }) => {
  const {
    selectedLanguage,
    setSelectedLanguage,
    toggleConsole,
    showConsole,
    isExecuting,
    connectionStatus,
    roomId,
    collaborators,
    userId,
    showCollaboratorPanel,
    setShowCollaboratorPanel,
    theme,
    toggleTheme,
    splitViewMode,
    setSplitViewMode,
    editorContent,
    editorMode,
    setEditorMode,
    independentContent,
    setIndependentContent,
    independentLanguage,
    setIndependentLanguage,
    broadcastEditorState,
  } = useApp();

  const { t, language: uiLanguage, setLanguage: setUILanguage } = useI18n();

  const [copyMessage, setCopyMessage] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取语言对应的文件扩展名
  const getFileExtension = (langId: string): string => {
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      php: 'php',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      r: 'r',
      perl: 'pl',
      lua: 'lua',
      bash: 'sh',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    return extensionMap[langId] || 'txt';
  };

  // 根据文件扩展名推断语言
  const getLanguageFromExtension = (filename: string): string | null => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cc: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      r: 'r',
      pl: 'perl',
      lua: 'lua',
      sh: 'bash',
      bash: 'bash',
      sql: 'sql',
      html: 'html',
      css: 'css',
    };
    return ext ? langMap[ext] || null : null;
  };

  // 导出文件 - 根据当前模式导出相应内容
  const handleExportFile = () => {
    // 如果在独立模式，导出独立编辑器内容；否则导出共享编辑器内容
    const contentToExport = editorMode === 'independent' ? independentContent : editorContent;
    const langToUse = editorMode === 'independent' 
      ? (typeof independentLanguage === 'string' ? independentLanguage : independentLanguage.id)
      : selectedLanguage.id;
    const ext = getFileExtension(langToUse);
    const filename = `cocode_${new Date().toISOString().slice(0, 10)}.${ext}`;
    const blob = new Blob([contentToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(t.exportSuccess, 'success');
    setShowFileMenu(false);
  };

  // 导入文件
  const handleImportFile = () => {
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  // 处理文件选择 - 导入到独立编辑器（只在自己的编辑器显示，不同步）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      
      // 切换到独立模式并设置内容
      setEditorMode('independent');
      setIndependentContent(content);
      
      // 尝试根据文件扩展名自动切换语言
      const detectedLang = getLanguageFromExtension(file.name);
      if (detectedLang) {
        const lang = SUPPORTED_LANGUAGES.find(l => l.id === detectedLang);
        if (lang) {
          setIndependentLanguage(lang);
        }
      }
      
      // 如果不在分屏模式，自动开启垂直分屏以显示独立编辑器
      if (splitViewMode === 'single') {
        setSplitViewMode('vertical');
      }
      
      // 广播状态变更
      setTimeout(() => broadcastEditorState(), 100);
      
      showToast(t.importSuccess, 'success');
    };
    reader.onerror = () => {
      showToast(t.importError, 'error');
    };
    reader.readAsText(file);
    
    // 清空 input 以便可以重复选择同一文件
    e.target.value = '';
  };

  const handleCopyInviteLink = async () => {
    const url = window.location.href;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setCopyMessage('✓');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopyMessage('✓');
        } else {
          window.prompt('Copy this link:', url);
          setCopyMessage('');
          return;
        }
      }
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      window.prompt('Copy this link:', url);
      setCopyMessage('');
    }
  };

  const handleLanguageChange = (langId: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.id === langId);
    if (lang) {
      // If there are other collaborators, ask for confirmation
      if (collaborators.length > 0 && onLanguageChangeRequest) {
        onLanguageChangeRequest(lang);
      } else {
        setSelectedLanguage(lang);
      }
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return t.online;
      case 'connecting': return t.connecting;
      case 'disconnected': return t.offline;
    }
  };

  return (
    <header className="bg-editor-sidebar border-b border-editor-border px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Room Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💻</span>
            <h1 className="text-xl font-bold text-white hidden sm:block">{t.appName}</h1>
          </div>
          
          {/* Room Badge */}
          <div className="flex items-center gap-2 bg-editor-bg px-3 py-1 rounded-lg">
            <span className="text-gray-400 text-sm hidden sm:inline">{t.room}:</span>
            <code className="text-blue-400 text-sm font-mono">{roomId.slice(0, 8)}</code>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
            <span className="text-gray-400 text-sm hidden sm:inline">{getStatusText()}</span>
          </div>

          {/* Collaborator Avatars */}
          <CollaboratorAvatars
            collaborators={collaborators}
            currentUserId={userId}
            onClick={() => setShowCollaboratorPanel(!showCollaboratorPanel)}
          />

          {/* Collaborators Count Button */}
          <button
            onClick={() => setShowCollaboratorPanel(!showCollaboratorPanel)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              showCollaboratorPanel 
                ? 'bg-blue-600 text-white' 
                : 'bg-editor-bg hover:bg-gray-700 text-gray-300'
            }`}
            title={t.collaborators}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium">{collaborators.length + 1}</span>
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Programming Language Selector */}
          <select
            value={selectedLanguage.id}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-editor-bg text-white border border-editor-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            title={t.language}
            aria-label={t.language}
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>

          {/* Split View Selector */}
          <SplitViewSelector
            mode={splitViewMode}
            onChange={setSplitViewMode}
            disabled={collaborators.length === 0}
          />

          {/* UI Language Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-editor-bg hover:bg-gray-700 transition-colors text-sm"
              title={t.interfaceLanguage}
            >
              <span>{uiLanguage === 'en' ? '🇺🇸' : '🇨🇳'}</span>
              <span className="hidden sm:inline">{uiLanguage === 'en' ? 'EN' : '中'}</span>
            </button>
            {showLanguageMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowLanguageMenu(false)} />
                <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 py-1 min-w-[100px]">
                  <button
                    onClick={() => { setUILanguage('en'); setShowLanguageMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      uiLanguage === 'en' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => { setUILanguage('zh'); setShowLanguageMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      uiLanguage === 'zh' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🇨🇳 中文
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-editor-bg hover:bg-gray-700 transition-colors"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* File Import/Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className="flex items-center gap-1 p-2 rounded-lg bg-editor-bg hover:bg-gray-700 transition-colors"
              title={`${t.importFile}/${t.exportFile}`}
            >
              📁
            </button>
            {showFileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFileMenu(false)} />
                <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 py-1 min-w-[120px]">
                  <button
                    onClick={handleImportFile}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    📥 {t.importFile}
                  </button>
                  <button
                    onClick={handleExportFile}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    📤 {t.exportFile}
                  </button>
                </div>
              </>
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".js,.ts,.py,.java,.c,.cpp,.cs,.go,.rs,.rb,.php,.swift,.kt,.scala,.r,.pl,.lua,.sh,.sql,.html,.css,.txt"
              onChange={handleFileChange}
              className="hidden"
              aria-label={t.importFile}
            />
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-editor-bg hover:bg-gray-700 transition-colors"
            title={`${t.settings} (Ctrl+,)`}
          >
            ⚙️
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-editor-bg hover:bg-gray-700 transition-colors"
            title={`${t.help} (F1)`}
          >
            ❓
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyInviteLink}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            title={t.share}
          >
            <span>🔗</span>
            <span className="hidden sm:inline">{copyMessage || t.share}</span>
          </button>

          {/* Console Toggle */}
          <button
            onClick={toggleConsole}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
              showConsole 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-editor-bg hover:bg-gray-700 text-gray-300'
            }`}
            title={t.console}
          >
            <span>📟</span>
            <span className="hidden sm:inline">{t.console}</span>
          </button>

          {/* Run Button */}
          <button
            onClick={onRunCode}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all text-sm font-semibold ${
              isExecuting
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30 hover:shadow-green-500/40'
            }`}
            title={`${t.run} (Ctrl+Enter / F5)`}
          >
            {isExecuting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden sm:inline">{t.running}</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span className="hidden sm:inline">{t.run}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Toolbar;

