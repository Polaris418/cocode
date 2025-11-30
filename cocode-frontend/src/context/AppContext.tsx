import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProgrammingLanguage, CollaboratorInfo, Theme, SplitViewMode, LanguageChangeEvent, EditorMode } from '../types';
import { SUPPORTED_LANGUAGES, generateUserName, getRandomColor, generateRoomId } from '../constants';

// WebSocket provider reference for broadcasting messages
let wsProviderRef: any = null;
export const setWsProvider = (provider: any) => { wsProviderRef = provider; };
export const getWsProvider = () => wsProviderRef;

interface AppState {
  // User
  userName: string;
  userId: string;
  userColor: string;
  setUserName: (name: string) => void;
  
  // Room
  roomId: string;
  setRoomId: (id: string) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
  collaborators: CollaboratorInfo[];
  setCollaborators: (users: CollaboratorInfo[]) => void;
  
  // Editor
  selectedLanguage: ProgrammingLanguage;
  setSelectedLanguage: (lang: ProgrammingLanguage) => void;
  editorContent: string;
  setEditorContent: (content: string) => void;
  
  // Split View Editor Mode
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  independentContent: string;
  setIndependentContent: (content: string) => void;
  independentLanguage: ProgrammingLanguage;
  setIndependentLanguage: (lang: ProgrammingLanguage) => void;
  
  // Editor lock state
  isEditorLocked: boolean;
  setIsEditorLocked: (locked: boolean) => void;
  
  // Broadcast editor state to other users
  broadcastEditorState: () => void;
  
  // Console
  showConsole: boolean;
  setShowConsole: (show: boolean) => void;
  toggleConsole: () => void;
  consoleOutput: string;
  setConsoleOutput: (output: string) => void;
  isExecuting: boolean;
  setIsExecuting: (executing: boolean) => void;
  
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  
  // UI
  showUserList: boolean;
  setShowUserList: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  
  // Split View
  splitViewMode: SplitViewMode;
  setSplitViewMode: (mode: SplitViewMode) => void;
  followingUserId: number | null;
  setFollowingUserId: (id: number | null) => void;
  
  // Collaboration notifications
  pendingLanguageChange: LanguageChangeEvent | null;
  setPendingLanguageChange: (event: LanguageChangeEvent | null) => void;
  showCollaboratorPanel: boolean;
  setShowCollaboratorPanel: (show: boolean) => void;
  
  // Broadcast language change to other users
  broadcastLanguageChange: (lang: ProgrammingLanguage) => void;
  
  // 共享编辑器数量限制
  sharedEditorCount: number;
  maxSharedEditors: number;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Get room ID from URL or generate new one (only once)
const getInitialRoomId = (): string => {
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  if (room) {
    console.log('Using room from URL:', room);
    return room;
  }
  const newRoom = generateRoomId();
  console.log('Generated new room:', newRoom);
  window.history.replaceState({}, '', `?room=${newRoom}`);
  return newRoom;
};

// Generate user ID once
const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substring(2, 11);
};

// Initialize once outside component
const initialRoomId = getInitialRoomId();
const initialUserId = generateUserId();

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // User state
  const [userName, setUserName] = useState(generateUserName());
  const [userColor] = useState(getRandomColor());
  const [userId] = useState(initialUserId);
  
  // Room state - use the pre-computed initialRoomId
  const [roomId, setRoomId] = useState(initialRoomId);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  
  // Editor state
  const [selectedLanguage, setSelectedLanguageState] = useState<ProgrammingLanguage>(SUPPORTED_LANGUAGES[0]);
  const [editorContent, setEditorContent] = useState('');
  
  // Split View Editor Mode state
  const [editorMode, setEditorMode] = useState<EditorMode>('shared');
  const [independentContent, setIndependentContent] = useState('');
  const [independentLanguage, setIndependentLanguage] = useState<ProgrammingLanguage>(SUPPORTED_LANGUAGES[0]);
  const [isEditorLocked, setIsEditorLocked] = useState(false);
  
  // Console state
  const [showConsole, setShowConsole] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<Theme>('dark');
  
  // UI state
  const [showUserList, setShowUserList] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Split View state
  const [splitViewMode, setSplitViewMode] = useState<SplitViewMode>('single');
  const [followingUserId, setFollowingUserId] = useState<number | null>(null);
  
  // Collaboration state
  const [pendingLanguageChange, setPendingLanguageChange] = useState<LanguageChangeEvent | null>(null);
  const [showCollaboratorPanel, setShowCollaboratorPanel] = useState(false);

  const toggleConsole = useCallback(() => {
    setShowConsole(prev => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Set language and broadcast to others
  const setSelectedLanguage = useCallback((lang: ProgrammingLanguage) => {
    setSelectedLanguageState(lang);
  }, []);

  // Broadcast language change to other users via awareness
  const broadcastLanguageChange = useCallback((lang: ProgrammingLanguage) => {
    const provider = getWsProvider();
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('languageChange', {
        language: lang.id,
        languageName: lang.name,
        timestamp: Date.now(),
        fromUser: {
          id: userId,
          name: userName,
          color: userColor,
        },
      });
    }
  }, [userId, userName, userColor]);

  // Broadcast editor state (mode, content, language, locked) to other users
  const broadcastEditorState = useCallback(() => {
    const provider = getWsProvider();
    if (provider && provider.awareness) {
      provider.awareness.setLocalStateField('editorState', {
        mode: editorMode,
        content: editorMode === 'independent' ? independentContent : '',
        language: editorMode === 'independent' ? independentLanguage.id : selectedLanguage.id,
        languageName: editorMode === 'independent' ? independentLanguage.name : selectedLanguage.name,
        isLocked: isEditorLocked,
        timestamp: Date.now(),
      });
    }
  }, [editorMode, independentContent, independentLanguage, selectedLanguage, isEditorLocked]);

  // 计算共享编辑器数量（当前用户 + 协作者中使用共享模式的）
  const sharedEditorCount = (editorMode === 'shared' ? 1 : 0) + 
    collaborators.filter(c => c.editorMode === 'shared' || c.editorMode === undefined).length;
  const maxSharedEditors = 2;

  const value: AppState = {
    userName,
    userId,
    userColor,
    setUserName,
    roomId,
    setRoomId,
    connectionStatus,
    setConnectionStatus,
    collaborators,
    setCollaborators,
    selectedLanguage,
    setSelectedLanguage,
    editorContent,
    setEditorContent,
    editorMode,
    setEditorMode,
    independentContent,
    setIndependentContent,
    independentLanguage,
    setIndependentLanguage,
    isEditorLocked,
    setIsEditorLocked,
    showConsole,
    setShowConsole,
    toggleConsole,
    consoleOutput,
    setConsoleOutput,
    isExecuting,
    setIsExecuting,
    theme,
    toggleTheme,
    showUserList,
    setShowUserList,
    showSettings,
    setShowSettings,
    splitViewMode,
    setSplitViewMode,
    followingUserId,
    setFollowingUserId,
    pendingLanguageChange,
    setPendingLanguageChange,
    showCollaboratorPanel,
    setShowCollaboratorPanel,
    broadcastLanguageChange,
    broadcastEditorState,
    sharedEditorCount,
    maxSharedEditors,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
