import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

const notifications = [
  { id: 1, type: 'task', title: 'New task assigned', message: 'You have been assigned to "Design Homepage"', time: '2m ago', unread: true },
  { id: 2, type: 'comment', title: 'New comment', message: 'Sarah commented on your task', time: '15m ago', unread: true },
  { id: 3, type: 'update', title: 'Project updated', message: 'Website Redesign project has been updated', time: '1h ago', unread: false },
];

export default function NotificationDropdown({ onOpen }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationClosing, setNotificationClosing] = useState(false);
  const notificationRef = useRef(null);

  const closeWithAnimation = () => {
    setNotificationClosing(true);
    setTimeout(() => {
      setNotificationOpen(false);
      setNotificationClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationOpen && notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeWithAnimation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && notificationOpen) {
        closeWithAnimation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [notificationOpen]);

  const handleToggle = () => {
    if (notificationOpen) {
      closeWithAnimation();
    } else {
      if (onOpen) onOpen();
      setNotificationOpen(true);
      setNotificationClosing(false);
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={handleToggle}
        className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 relative transition-all duration-200 hover:shadow-md"
      >
        <Bell size={18} />
        {notifications.filter(n => n.unread).length > 0 && (
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
        )}
      </button>

      {(notificationOpen || notificationClosing) && (
        <div className={`absolute max-[425px]:-right-[10vw] right-0 mt-2 w-80 max-[480px]:w-[calc(100vw-2rem)] max-[480px]:max-w-[320px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 origin-top-right ${
          notificationClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
        }`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{notifications.filter(n => n.unread).length} unread notifications</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 transition-colors duration-150 ${notification.unread ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'task' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' :
                    notification.type === 'comment' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' :
                    'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                  }`}>
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-800 dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/notifications" className="block p-3 text-center text-sm text-accent hover:bg-gray-50 dark:hover:bg-gray-700 font-medium border-t border-gray-100 dark:border-gray-700">
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}
