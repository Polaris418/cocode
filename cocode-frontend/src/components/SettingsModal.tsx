import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userName, setUserName, theme, toggleTheme } = useApp();
  const { t, language: uiLanguage, setLanguage: setUILanguage } = useI18n();
  const [tempName, setTempName] = useState(userName);
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('cocode-fontSize') || '14';
  });
  const [tabSize, setTabSize] = useState(() => {
    return localStorage.getItem('cocode-tabSize') || '2';
  });
  const [wordWrap, setWordWrap] = useState(() => {
    return localStorage.getItem('cocode-wordWrap') !== 'false';
  });
  const [minimap, setMinimap] = useState(() => {
    return localStorage.getItem('cocode-minimap') !== 'false';
  });

  useEffect(() => {
    setTempName(userName);
  }, [userName]);

  const handleSave = () => {
    setUserName(tempName);
    localStorage.setItem('cocode-fontSize', fontSize);
    localStorage.setItem('cocode-tabSize', tabSize);
    localStorage.setItem('cocode-wordWrap', String(wordWrap));
    localStorage.setItem('cocode-minimap', String(minimap));
    
    // Dispatch custom event to notify editor of settings change
    window.dispatchEvent(new CustomEvent('cocode-settings-changed', {
      detail: { fontSize, tabSize, wordWrap, minimap }
    }));
    
    onClose();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-editor-sidebar border border-editor-border rounded-lg w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>⚙️</span> Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">User</h3>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-editor-bg border border-editor-border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Editor Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Editor</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full bg-editor-bg border border-editor-border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Font Size"
                >
                  {[12, 13, 14, 15, 16, 18, 20, 22, 24].map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-1">Tab Size</label>
                <select
                  value={tabSize}
                  onChange={(e) => setTabSize(e.target.value)}
                  className="w-full bg-editor-bg border border-editor-border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Tab Size"
                >
                  {[2, 4, 8].map(size => (
                    <option key={size} value={size}>{size} spaces</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Word Wrap</span>
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className={`w-12 h-6 rounded-full transition-colors ${wordWrap ? 'bg-blue-600' : 'bg-gray-600'}`}
                aria-label="Toggle Word Wrap"
                title={wordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${wordWrap ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Show Minimap</span>
              <button
                onClick={() => setMinimap(!minimap)}
                className={`w-12 h-6 rounded-full transition-colors ${minimap ? 'bg-blue-600' : 'bg-gray-600'}`}
                aria-label="Toggle Minimap"
                title={minimap ? 'Hide Minimap' : 'Show Minimap'}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${minimap ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{t.theme}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{t.themeDark}</span>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-600'}`}
                aria-label="Toggle Dark Theme"
                title={theme === 'dark' ? t.themeLight : t.themeDark}
              >
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            
            {/* UI Language */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">{t.interfaceLanguage}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setUILanguage('en')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    uiLanguage === 'en' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🇺🇸 EN
                </button>
                <button
                  onClick={() => setUILanguage('zh')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    uiLanguage === 'zh' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🇨🇳 中文
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-editor-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
