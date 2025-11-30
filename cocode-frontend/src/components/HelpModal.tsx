import { useState } from 'react';
import { useI18n } from '../i18n';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'features' | 'about'>('shortcuts');
  const { t } = useI18n();

  if (!isOpen) return null;

  const shortcuts = [
    { keys: 'Ctrl + Enter', action: 'Run code', mac: '⌘ + Enter' },
    { keys: 'F5', action: 'Run code', mac: 'F5' },
    { keys: 'Ctrl + `', action: 'Toggle console', mac: '⌘ + `' },
    { keys: 'Ctrl + ,', action: 'Open settings', mac: '⌘ + ,' },
    { keys: 'Ctrl + S', action: 'Save (auto-saved)', mac: '⌘ + S' },
    { keys: 'Ctrl + B', action: 'Toggle sidebar', mac: '⌘ + B' },
    { keys: 'Ctrl + /', action: 'Toggle comment', mac: '⌘ + /' },
    { keys: 'Ctrl + D', action: 'Select next occurrence', mac: '⌘ + D' },
    { keys: 'Ctrl + Shift + K', action: 'Delete line', mac: '⌘ + Shift + K' },
    { keys: 'Alt + ↑/↓', action: 'Move line up/down', mac: '⌥ + ↑/↓' },
    { keys: 'Ctrl + Space', action: 'Trigger suggestions', mac: '⌘ + Space' },
    { keys: 'F2', action: 'Rename symbol', mac: 'F2' },
    { keys: 'Ctrl + G', action: 'Go to line', mac: '⌘ + G' },
    { keys: 'Ctrl + F', action: 'Find', mac: '⌘ + F' },
    { keys: 'Ctrl + H', action: 'Find and replace', mac: '⌘ + H' },
    { keys: 'Escape', action: 'Close console/dialog', mac: 'Escape' },
  ];

  const features = [
    { icon: '👥', title: 'Real-time Collaboration', desc: 'Code together with multiple users in real-time. Share the room link to invite others.' },
    { icon: '🎨', title: 'Syntax Highlighting', desc: 'Beautiful syntax highlighting for 10+ programming languages.' },
    { icon: '💡', title: 'IntelliSense', desc: 'Smart code completions, parameter hints, and quick info.' },
    { icon: '▶️', title: 'Code Execution', desc: 'Run your code directly in the browser with Piston API.' },
    { icon: '🔄', title: 'Auto Sync', desc: 'Your code is automatically synced across all collaborators.' },
    { icon: '🌙', title: 'Dark/Light Theme', desc: 'Switch between dark and light themes.' },
    { icon: '📊', title: 'Live Stats', desc: 'See line count, word count, and cursor position.' },
    { icon: '🔗', title: 'Easy Sharing', desc: 'One-click room sharing with URL.' },
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-editor-sidebar border border-editor-border rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>❓</span> {t.helpTitle}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title={t.close}
            aria-label={t.close}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-editor-border">
          {[
            { id: 'shortcuts', label: `⌨️ ${t.keyboardShortcuts}` },
            { id: 'features', label: `✨ ${t.features}` },
            { id: 'about', label: 'ℹ️ About' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {activeTab === 'shortcuts' && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm mb-4">
                Showing {isMac ? 'Mac' : 'Windows/Linux'} shortcuts
              </p>
              <div className="grid gap-2">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-editor-border/50">
                    <span className="text-gray-300">{shortcut.action}</span>
                    <kbd className="bg-editor-bg px-3 py-1 rounded text-sm font-mono text-blue-400">
                      {isMac ? shortcut.mac : shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4 p-3 rounded-lg bg-editor-bg">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="text-white font-medium">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💻</div>
              <h3 className="text-2xl font-bold text-white mb-2">CoCode</h3>
              <p className="text-gray-400 mb-4">Real-time Collaborative Code Editor</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Version 1.0.0</p>
                <p>Built with React, TypeScript, Monaco Editor, and Yjs</p>
                <p className="mt-4">
                  <a href="#" className="text-blue-400 hover:underline">GitHub</a>
                  {' • '}
                  <a href="#" className="text-blue-400 hover:underline">Documentation</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
