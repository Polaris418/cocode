import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface StatusBarProps {
  cursorPosition?: { line: number; column: number };
}

const StatusBar: React.FC<StatusBarProps> = ({ cursorPosition: propsCursor }) => {
  const { 
    selectedLanguage, 
    editorContent, 
    connectionStatus, 
    collaborators,
    roomId 
  } = useApp();
  
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Use props if provided, otherwise listen for events
  useEffect(() => {
    if (propsCursor) {
      setCursorPosition(propsCursor);
    }
  }, [propsCursor]);

  // Listen for cursor position updates from editor
  useEffect(() => {
    if (propsCursor) return; // Skip if using props
    
    const handleCursorChange = (e: CustomEvent) => {
      setCursorPosition(e.detail);
    };

    window.addEventListener('cocode-cursor-change' as any, handleCursorChange);
    return () => window.removeEventListener('cocode-cursor-change' as any, handleCursorChange);
  }, [propsCursor]);

  const lineCount = editorContent.split('\n').length;
  const charCount = editorContent.length;
  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;

  return (
    <footer className="bg-blue-600 text-white text-xs px-4 py-1 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`} />
          <span>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
        </div>

        {/* Room ID */}
        <div className="flex items-center gap-1">
          <span>🏠</span>
          <span>{roomId}</span>
        </div>

        {/* Online Users */}
        <div className="flex items-center gap-1">
          <span>👥</span>
          <span>{collaborators.length + 1} online</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Cursor Position */}
        <span>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>

        {/* Document Stats */}
        <span>{lineCount} lines</span>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>

        {/* Language */}
        <div className="flex items-center gap-1 bg-blue-700 px-2 py-0.5 rounded">
          <span>{selectedLanguage.icon}</span>
          <span>{selectedLanguage.name}</span>
        </div>

        {/* Encoding */}
        <span>UTF-8</span>
      </div>
    </footer>
  );
};

export default StatusBar;
