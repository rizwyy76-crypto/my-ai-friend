import React from 'react';
import { X, Bell, CheckCheck, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTaskFlow } from '../context/TaskFlowContext';

export const NotificationCenterModal: React.FC = () => {
  const {
    isNotifModalOpen,
    setIsNotifModalOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    triggerPushNotification,
    setActiveTask,
    tasks,
  } = useTaskFlow();

  if (!isNotifModalOpen) return null;

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      triggerPushNotification('Push Notifications Activated! 🔔', 'TaskFlow will notify you of deadlines and task assignments.');
    }
  };

  const handleSendTestAlert = () => {
    triggerPushNotification(
      'Deadline Alert: Due in 2 hours ⏳',
      'Task "Push notification engine for upcoming deadline alerts" requires your attention.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications & Reminders</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={() => setIsNotifModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action strip: Push settings */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">Browser push permissions:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-medium"
            >
              Request Access
            </button>
            <button
              onClick={handleSendTestAlert}
              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-md text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100"
            >
              Send Test Alert
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No notifications yet. You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => {
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.task_id) {
                      const t = tasks.find((item) => item.id === notif.task_id);
                      if (t) {
                        setActiveTask(t);
                        setIsNotifModalOpen(false);
                      }
                    }
                  }}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    !notif.is_read
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {notif.task_id && (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
