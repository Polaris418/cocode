import React from 'react';
import { useI18n } from '../i18n';
import { User } from '../types';

interface LanguageNotificationProps {
  show: boolean;
  fromUser: User;
  languageName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const LanguageNotification: React.FC<LanguageNotificationProps> = ({
  show,
  fromUser,
  languageName,
  onAccept,
  onDecline,
}) => {
  const { t } = useI18n();

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-gray-800 border border-blue-500 rounded-lg shadow-xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: fromUser.color }}
          >
            {fromUser.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Message */}
          <div className="flex-1">
            <p className="text-gray-100 text-sm">
              <span className="font-semibold" style={{ color: fromUser.color }}>
                {fromUser.name}
              </span>{' '}
              {t.languageChangeRequest}{' '}
              <span className="font-semibold text-yellow-400">{languageName}</span>
            </p>
            
            {/* Buttons */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onAccept}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.accept}
              </button>
              <button
                onClick={onDecline}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t.decline}
              </button>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onDecline}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title={t.close}
            aria-label={t.close}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple notification for when someone changes language (info only)
interface LanguageChangedNotificationProps {
  show: boolean;
  fromUser: User;
  languageName: string;
  onClose: () => void;
}

export const LanguageChangedNotification: React.FC<LanguageChangedNotificationProps> = ({
  show,
  fromUser,
  languageName,
  onClose,
}) => {
  const { t } = useI18n();

  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in">
      <div className="bg-gray-800 border border-yellow-500/50 rounded-lg shadow-xl p-3 max-w-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: fromUser.color }}
          >
            {fromUser.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-200 text-sm flex-1">
            <span className="font-semibold" style={{ color: fromUser.color }}>
              {fromUser.name}
            </span>{' '}
            {t.userChangedLanguage}{' '}
            <span className="font-semibold text-yellow-400">{languageName}</span>
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title={t.close}
            aria-label={t.close}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
