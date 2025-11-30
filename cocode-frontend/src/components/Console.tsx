import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';

const Console: React.FC = () => {
  const { consoleOutput, setConsoleOutput } = useApp();
  const { t } = useI18n();

  return (
    <div className="h-full bg-editor-bg flex flex-col">
      {/* Console Header */}
      <div className="bg-editor-sidebar px-4 py-2 flex items-center justify-between border-b border-editor-border">
        <div className="flex items-center gap-2">
          <span>📟</span>
          <span className="text-white font-semibold text-sm">{t.console}</span>
        </div>
        <button
          onClick={() => setConsoleOutput('')}
          className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
          title={t.clear}
        >
          🗑️ {t.clear}
        </button>
      </div>
      
      {/* Console Content */}
      <div className="flex-1 overflow-auto p-4 font-mono">
        {consoleOutput ? (
          <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {consoleOutput}
          </pre>
        ) : (
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span>💡</span>
            <span>{t.noOutput}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Console;

