// Internationalization translations
export type Language = 'en' | 'zh';

export interface Translations {
  // App
  appName: string;
  
  // Toolbar
  room: string;
  share: string;
  run: string;
  running: string;
  settings: string;
  help: string;
  language: string;
  splitView: string;
  collaborators: string;
  
  // Status
  online: string;
  offline: string;
  connecting: string;
  users: string;
  
  // Editor
  editor: string;
  myEditor: string;
  theirEditor: string;
  following: string;
  stopFollowing: string;
  
  // Console
  console: string;
  clear: string;
  close: string;
  noOutput: string;
  executing: string;
  executionSuccess: string;
  executionError: string;
  executionFailed: string;
  output: string;
  stderr: string;
  error: string;
  exitCode: string;
  
  // Settings
  settingsTitle: string;
  editorSettings: string;
  theme: string;
  fontSize: string;
  tabSize: string;
  wordWrap: string;
  minimap: string;
  lineNumbers: string;
  autoSave: string;
  collaborationSettings: string;
  userName: string;
  userNamePlaceholder: string;
  showCursors: string;
  interfaceLanguage: string;
  save: string;
  cancel: string;
  
  // Help
  helpTitle: string;
  keyboardShortcuts: string;
  runCode: string;
  toggleConsole: string;
  openSettings: string;
  openHelp: string;
  closeModal: string;
  features: string;
  featureRealtime: string;
  featureMultiLang: string;
  featureExecution: string;
  featureSplit: string;
  
  // Notifications
  languageChangeRequest: string;
  userChangedLanguage: string;
  accept: string;
  decline: string;
  userJoined: string;
  userLeft: string;
  copiedToClipboard: string;
  copyFailed: string;
  
  // Split View
  splitViewMode: string;
  singleView: string;
  horizontalSplit: string;
  verticalSplit: string;
  follow: string;
  unfollow: string;
  
  // Collaborator Panel
  collaboratorPanel: string;
  noCollaborators: string;
  you: string;
  currentLanguage: string;
  cursorPosition: string;
  line: string;
  column: string;
  viewTheirCode: string;
  
  // Independent Editor
  independentEditor: string;
  independent: string;
  shared: string;
  switchToIndependent: string;
  switchToShared: string;
  editorModeShared: string;
  editorModeIndependent: string;
  sharedView: string;
  readOnly: string;
  maxSharedEditorsReached: string;
  
  // Editor Panel Controls
  minimize: string;
  maximize: string;
  restore: string;
  hidePanel: string;
  showPanel: string;
  hiddenPanels: string;
  noHiddenPanels: string;
  
  // Lock
  lock: string;
  unlock: string;
  locked: string;
  lockedByUser: string;
  
  // File operations
  importFile: string;
  exportFile: string;
  importSuccess: string;
  importError: string;
  exportSuccess: string;
  
  // Themes
  themeDark: string;
  themeLight: string;
  themeHighContrast: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // App
    appName: 'CoCode',
    
    // Toolbar
    room: 'Room',
    share: 'Share',
    run: 'Run',
    running: 'Running...',
    settings: 'Settings',
    help: 'Help',
    language: 'Language',
    splitView: 'Split View',
    collaborators: 'Collaborators',
    
    // Status
    online: 'Online',
    offline: 'Offline',
    connecting: 'Connecting...',
    users: 'users',
    
    // Editor
    editor: 'Editor',
    myEditor: 'My Editor',
    theirEditor: "'s Editor",
    following: 'Following',
    stopFollowing: 'Stop Following',
    
    // Console
    console: 'Console',
    clear: 'Clear',
    close: 'Close',
    noOutput: 'No output yet. Run your code to see results.',
    executing: '⏳ Executing code...',
    executionSuccess: 'Code executed successfully!',
    executionError: 'Code execution completed with errors',
    executionFailed: 'Execution failed',
    output: '✅ Output',
    stderr: '⚠️ Stderr',
    error: '❌ Error',
    exitCode: '📋 Exit code',
    
    // Settings
    settingsTitle: 'Settings',
    editorSettings: 'Editor Settings',
    theme: 'Theme',
    fontSize: 'Font Size',
    tabSize: 'Tab Size',
    wordWrap: 'Word Wrap',
    minimap: 'Minimap',
    lineNumbers: 'Line Numbers',
    autoSave: 'Auto Save',
    collaborationSettings: 'Collaboration Settings',
    userName: 'User Name',
    userNamePlaceholder: 'Enter your name',
    showCursors: 'Show Other Cursors',
    interfaceLanguage: 'Interface Language',
    save: 'Save',
    cancel: 'Cancel',
    
    // Help
    helpTitle: 'Help & Shortcuts',
    keyboardShortcuts: 'Keyboard Shortcuts',
    runCode: 'Run Code',
    toggleConsole: 'Toggle Console',
    openSettings: 'Open Settings',
    openHelp: 'Open Help',
    closeModal: 'Close Modal',
    features: 'Features',
    featureRealtime: 'Real-time collaborative editing',
    featureMultiLang: 'Support for multiple programming languages',
    featureExecution: 'Code execution with Piston API',
    featureSplit: 'Split view to see collaborators\' code',
    
    // Notifications
    languageChangeRequest: 'wants to switch language to',
    userChangedLanguage: 'changed language to',
    accept: 'Accept',
    decline: 'Decline',
    userJoined: 'joined the room',
    userLeft: 'left the room',
    copiedToClipboard: 'Link copied to clipboard!',
    copyFailed: 'Failed to copy link',
    
    // Split View
    splitViewMode: 'Split View Mode',
    singleView: 'Single',
    horizontalSplit: 'Horizontal',
    verticalSplit: 'Vertical',
    follow: 'Follow',
    unfollow: 'Unfollow',
    
    // Collaborator Panel
    collaboratorPanel: 'Collaborators',
    noCollaborators: 'No other collaborators yet',
    you: '(You)',
    currentLanguage: 'Language',
    cursorPosition: 'Cursor',
    line: 'Line',
    column: 'Col',
    viewTheirCode: 'View Code',
    
    // Independent Editor
    independentEditor: 'My Workspace',
    independent: 'Independent',
    shared: 'Shared',
    switchToIndependent: 'Switch to independent mode',
    switchToShared: 'Switch to shared mode',
    editorModeShared: 'Shared editing mode',
    editorModeIndependent: 'Independent editing mode',
    sharedView: 'Shared View',
    readOnly: 'Read-only',
    maxSharedEditorsReached: 'Maximum shared editors reached (2)',
    
    // Editor Panel Controls
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    hidePanel: 'Hide',
    showPanel: 'Show',
    hiddenPanels: 'Hidden Panels',
    noHiddenPanels: 'No hidden panels',
    
    // Lock
    lock: 'Lock',
    unlock: 'Unlock',
    locked: 'Locked',
    lockedByUser: 'Locked',
    
    // File operations
    importFile: 'Import',
    exportFile: 'Export',
    importSuccess: 'File imported successfully',
    importError: 'Failed to import file',
    exportSuccess: 'File exported successfully',
    
    // Themes
    themeDark: 'Dark',
    themeLight: 'Light',
    themeHighContrast: 'High Contrast',
  },
  
  zh: {
    // App
    appName: 'CoCode 协作编程',
    
    // Toolbar
    room: '房间',
    share: '分享',
    run: '运行',
    running: '运行中...',
    settings: '设置',
    help: '帮助',
    language: '语言',
    splitView: '分屏',
    collaborators: '协作者',
    
    // Status
    online: '在线',
    offline: '离线',
    connecting: '连接中...',
    users: '人',
    
    // Editor
    editor: '编辑器',
    myEditor: '我的编辑器',
    theirEditor: '的编辑器',
    following: '跟随中',
    stopFollowing: '停止跟随',
    
    // Console
    console: '控制台',
    clear: '清空',
    close: '关闭',
    noOutput: '暂无输出。运行代码查看结果。',
    executing: '⏳ 正在执行代码...',
    executionSuccess: '代码执行成功！',
    executionError: '代码执行完成，但有错误',
    executionFailed: '执行失败',
    output: '✅ 输出',
    stderr: '⚠️ 标准错误',
    error: '❌ 错误',
    exitCode: '📋 退出码',
    
    // Settings
    settingsTitle: '设置',
    editorSettings: '编辑器设置',
    theme: '主题',
    fontSize: '字体大小',
    tabSize: 'Tab 大小',
    wordWrap: '自动换行',
    minimap: '小地图',
    lineNumbers: '行号',
    autoSave: '自动保存',
    collaborationSettings: '协作设置',
    userName: '用户名',
    userNamePlaceholder: '输入你的名字',
    showCursors: '显示其他用户光标',
    interfaceLanguage: '界面语言',
    save: '保存',
    cancel: '取消',
    
    // Help
    helpTitle: '帮助与快捷键',
    keyboardShortcuts: '键盘快捷键',
    runCode: '运行代码',
    toggleConsole: '切换控制台',
    openSettings: '打开设置',
    openHelp: '打开帮助',
    closeModal: '关闭弹窗',
    features: '功能特性',
    featureRealtime: '实时协作编辑',
    featureMultiLang: '支持多种编程语言',
    featureExecution: '使用 Piston API 执行代码',
    featureSplit: '分屏查看协作者代码',
    
    // Notifications
    languageChangeRequest: '想要切换编程语言为',
    userChangedLanguage: '将语言切换为',
    accept: '接受',
    decline: '拒绝',
    userJoined: '加入了房间',
    userLeft: '离开了房间',
    copiedToClipboard: '链接已复制到剪贴板！',
    copyFailed: '复制链接失败',
    
    // Split View
    splitViewMode: '分屏模式',
    singleView: '单屏',
    horizontalSplit: '水平分屏',
    verticalSplit: '垂直分屏',
    follow: '跟随',
    unfollow: '取消跟随',
    
    // Collaborator Panel
    collaboratorPanel: '协作者',
    noCollaborators: '暂无其他协作者',
    you: '(你)',
    currentLanguage: '语言',
    cursorPosition: '光标',
    line: '行',
    column: '列',
    viewTheirCode: '查看代码',
    
    // Independent Editor
    independentEditor: '我的工作区',
    independent: '独立',
    shared: '共享',
    switchToIndependent: '切换到独立模式',
    switchToShared: '切换到共享模式',
    editorModeShared: '共享编辑模式',
    editorModeIndependent: '独立编辑模式',
    sharedView: '共享视图',
    readOnly: '只读',
    maxSharedEditorsReached: '已达到共享编辑器数量上限（最多2个）',
    
    // Editor Panel Controls
    minimize: '最小化',
    maximize: '最大化',
    restore: '还原',
    hidePanel: '隐藏',
    showPanel: '显示',
    hiddenPanels: '隐藏的面板',
    noHiddenPanels: '无隐藏面板',
    
    // Lock
    lock: '锁定',
    unlock: '解锁',
    locked: '已锁定',
    lockedByUser: '已锁定',
    
    // File operations
    importFile: '导入',
    exportFile: '导出',
    importSuccess: '文件导入成功',
    importError: '文件导入失败',
    exportSuccess: '文件导出成功',
    
    // Themes
    themeDark: '深色',
    themeLight: '浅色',
    themeHighContrast: '高对比度',
  },
};
