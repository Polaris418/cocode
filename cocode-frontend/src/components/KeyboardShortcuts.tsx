import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

const KeyboardShortcuts: React.FC = () => {
  const { toggleConsole, setShowSettings, showConsole, setShowConsole } = useApp();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + Enter: Run code
    if (cmdOrCtrl && e.key === 'Enter') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('cocode-run-code'));
    }

    // Ctrl/Cmd + `: Toggle console
    if (cmdOrCtrl && e.key === '`') {
      e.preventDefault();
      toggleConsole();
    }

    // Ctrl/Cmd + ,: Open settings
    if (cmdOrCtrl && e.key === ',') {
      e.preventDefault();
      setShowSettings(true);
    }

    // Ctrl/Cmd + S: Save (prevent default, show notification)
    if (cmdOrCtrl && e.key === 's') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('cocode-save'));
    }

    // Ctrl/Cmd + B: Toggle sidebar
    if (cmdOrCtrl && e.key === 'b') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('cocode-toggle-sidebar'));
    }

    // Escape: Close console if open
    if (e.key === 'Escape' && showConsole) {
      setShowConsole(false);
    }

    // F5: Run code
    if (e.key === 'F5') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('cocode-run-code'));
    }

    // Ctrl/Cmd + /: Toggle line comment (handled by Monaco)
    // Ctrl/Cmd + Shift + K: Delete line (handled by Monaco)
  }, [toggleConsole, setShowSettings, showConsole, setShowConsole]);

  // Register keyboard shortcuts
  useCallback(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
};

// Hook to use keyboard shortcuts
export const useKeyboardShortcuts = () => {
  const { toggleConsole, setShowSettings, showConsole, setShowConsole } = useApp();

  useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('cocode-run-code'));
      }

      if (cmdOrCtrl && e.key === '`') {
        e.preventDefault();
        toggleConsole();
      }

      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }

      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
      }

      if (e.key === 'Escape' && showConsole) {
        setShowConsole(false);
      }

      if (e.key === 'F5') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('cocode-run-code'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleConsole, setShowSettings, showConsole, setShowConsole]);
};

export default KeyboardShortcuts;
