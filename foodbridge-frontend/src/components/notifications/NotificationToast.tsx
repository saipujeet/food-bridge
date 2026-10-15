import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export const NotificationToast: React.FC = () => {
  const { toastNotification, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        dismissToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification, dismissToast]);

  if (!toastNotification) return null;

  const handleToastClick = () => {
    markAsRead(toastNotification.id);
    dismissToast();

    if (toastNotification.referenceType === 'DONATION' && toastNotification.referenceId) {
      navigate(`/donor/donations/${toastNotification.referenceId}`);
    } else if (toastNotification.referenceType === 'MATCH' && toastNotification.referenceId) {
      navigate(`/ngo/matches/${toastNotification.referenceId}`);
    } else if (toastNotification.referenceType === 'DELIVERY' && toastNotification.referenceId) {
      navigate(`/volunteer/deliveries/${toastNotification.referenceId}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl border-2 border-emerald-500 shadow-2xl p-4 cursor-pointer transform transition-all animate-bounce">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3" onClick={handleToastClick}>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
            🔔
          </div>
          <div>
            <span className="text-[9px] font-black text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {toastNotification.priority} ALERT
            </span>
            <h4 className="text-sm font-bold text-gray-900 mt-1">{toastNotification.title}</h4>
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{toastNotification.message}</p>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 text-xs font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
