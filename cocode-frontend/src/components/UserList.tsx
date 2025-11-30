import { useApp } from '../context/AppContext';

const UserList: React.FC = () => {
  const { collaborators, userName, userColor, showUserList } = useApp();

  if (!showUserList) return null;

  return (
    <div className="bg-editor-sidebar border-l border-editor-border w-56 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-editor-border">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <span>👥</span>
          <span>Collaborators ({collaborators.length + 1})</span>
        </h3>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-auto p-2">
        {/* Current User (You) */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-editor-bg mb-1">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
            style={{ backgroundColor: userColor }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">
              {userName}
            </div>
            <div className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              You
            </div>
          </div>
        </div>

        {/* Other Users */}
        {collaborators.map((collab) => (
          <div 
            key={collab.clientId}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-editor-bg transition-colors"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
              style={{ backgroundColor: collab.user.color }}
            >
              {collab.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {collab.user.name}
              </div>
              <div className="text-blue-400 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                Online
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {collaborators.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            <div className="text-2xl mb-2">🔗</div>
            <div>Share the room link to invite others!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
