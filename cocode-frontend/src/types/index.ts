export interface ProgrammingLanguage {
  id: string;
  name: string;
  monacoId: string;
  icon: string;
}

// Keep Language as alias for backward compatibility
export type Language = ProgrammingLanguage;

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface CollaboratorInfo {
  clientId: number;
  user: User;
  cursor?: CursorPosition;
  language?: string;
  isFollowing?: boolean;
  // 编辑器状态同步
  editorMode?: EditorMode;
  independentContent?: string;
  independentLanguage?: string;
  // 锁定状态 - 锁定后其他用户只能只读查看
  isLocked?: boolean;
}

// Editor modes for split view
export type EditorMode = 'shared' | 'independent';

// 用户编辑器状态（用于awareness同步）
export interface UserEditorState {
  mode: EditorMode;
  content: string;
  language: string;
  languageName: string;
  isLocked: boolean;
}

export interface CodeExecutionRequest {
  language: string;
  code: string;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

export interface RoomState {
  roomId: string;
  users: CollaboratorInfo[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
}

export type Theme = 'dark' | 'light';

// Split view types
export type SplitViewMode = 'single' | 'horizontal' | 'vertical';

// Collaboration event types
export interface LanguageChangeEvent {
  type: 'language-change-request' | 'language-change-accepted' | 'language-change-declined' | 'language-changed';
  fromUser: User;
  language: string;
  languageName: string;
}

export interface UserEvent {
  type: 'user-joined' | 'user-left' | 'cursor-update';
  user: User;
  cursor?: CursorPosition;
}

export interface CollaborationMessage {
  type: string;
  payload: LanguageChangeEvent | UserEvent | any;
}


