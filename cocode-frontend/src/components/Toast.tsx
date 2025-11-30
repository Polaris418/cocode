import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
  };

  return (
    <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="ml-2 hover:opacity-75"
        title="Close notification"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: CustomEvent<{ message: string; type?: 'success' | 'error' | 'info' | 'warning' }>) => {
      const newToast: ToastMessage = {
        id: Date.now(),
        message: e.detail.message,
        type: e.detail.type || 'info',
      };
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener('cocode-toast' as any, handleToast);
    return () => window.removeEventListener('cocode-toast' as any, handleToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Helper function to show toast
export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  window.dispatchEvent(new CustomEvent('cocode-toast', {
    detail: { message, type }
  }));
};

export default Toast;
