import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { CollaboratorInfo, SplitViewMode } from '../types';

interface CollaboratorPanelProps {
  collaborators: CollaboratorInfo[];
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  currentLanguage: string;
  onViewCollaborator: (collaborator: CollaboratorInfo) => void;
  onFollowCollaborator: (collaborator: CollaboratorInfo) => void;
  followingId?: number;
  splitViewMode: SplitViewMode;
}

export const CollaboratorPanel: React.FC<CollaboratorPanelProps> = ({
  collaborators,
  currentUserId,
  currentUserName,
  currentUserColor,
  currentLanguage,
  onViewCollaborator,
  onFollowCollaborator,
  followingId,
  splitViewMode,
}) => {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(true);

  const otherCollaborators = collaborators.filter(c => c.user.id !== currentUserId);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-750 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-200">{t.collaboratorPanel}</span>
          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
            {collaborators.length}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
          {/* Current User */}
          <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg border-l-2" style={{ borderLeftColor: currentUserColor }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: currentUserColor }}
            >
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-200 truncate">
                  {currentUserName}
                </span>
                <span className="text-xs text-green-400">{t.you}</span>
              </div>
              <span className="text-xs text-gray-500">{currentLanguage}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">{t.online}</span>
            </div>
          </div>

          {/* Other Collaborators */}
          {otherCollaborators.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {t.noCollaborators}
            </div>
          ) : (
            otherCollaborators.map((collab) => (
              <div
                key={collab.clientId}
                className="flex items-center gap-2 p-2 bg-gray-700/30 rounded-lg border-l-2 hover:bg-gray-700/50 transition-colors"
                style={{ borderLeftColor: collab.user.color }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: collab.user.color }}
                >
                  {collab.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-200 truncate block">
                    {collab.user.name}
                  </span>
                  {collab.cursor && (
                    <span className="text-xs text-gray-500">
                      {t.line} {collab.cursor.lineNumber}, {t.column} {collab.cursor.column}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {splitViewMode !== 'single' && (
                    <button
                      onClick={() => onFollowCollaborator(collab)}
                      className={`p-1.5 rounded transition-colors ${
                        followingId === collab.clientId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                      title={followingId === collab.clientId ? t.unfollow : t.follow}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onViewCollaborator(collab)}
                    className="p-1.5 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded transition-colors"
                    title={t.viewTheirCode}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Compact collaborator avatars for toolbar
interface CollaboratorAvatarsProps {
  collaborators: CollaboratorInfo[];
  currentUserId: string;
  maxVisible?: number;
  onClick?: () => void;
}

export const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  collaborators,
  currentUserId,
  maxVisible = 4,
  onClick,
}) => {
  const { t } = useI18n();
  const otherCollaborators = collaborators.filter(c => c.user.id !== currentUserId);
  const visibleCollaborators = otherCollaborators.slice(0, maxVisible);
  const hiddenCount = Math.max(0, otherCollaborators.length - maxVisible);

  if (otherCollaborators.length === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-700 transition-colors"
      title={`${otherCollaborators.length} ${t.collaborators}`}
    >
      <div className="flex -space-x-2">
        {visibleCollaborators.map((collab) => (
          <div
            key={collab.clientId}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-800"
            style={{ backgroundColor: collab.user.color }}
            title={collab.user.name}
          >
            {collab.user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {hiddenCount > 0 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gray-600 border-2 border-gray-800">
            +{hiddenCount}
          </div>
        )}
      </div>
    </button>
  );
};
