import { useState } from 'react';
import { Bell, CheckCircle, MessageCircle, UserPlus, AlertCircle, Calendar, Trash2, Check } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppearance } from '@/contexts/AppearanceContext';

const notificationData = [
  { 
    id: 1, 
    type: 'task', 
    icon: CheckCircle,
    color: 'blue',
    title: 'New task assigned', 
    message: 'You have been assigned to "Design Homepage" by Sarah Johnson', 
    time: '2 minutes ago', 
    unread: true 
  },
  { 
    id: 2, 
    type: 'comment', 
    icon: MessageCircle,
    color: 'green',
    title: 'New comment on your task', 
    message: 'Sarah Johnson commented: "Great work on the authentication module!"', 
    time: '15 minutes ago', 
    unread: true 
  },
  { 
    id: 3, 
    type: 'update', 
    icon: AlertCircle,
    color: 'purple',
    title: 'Project updated', 
    message: 'Website Redesign project deadline has been extended to Dec 15', 
    time: '1 hour ago', 
    unread: true 
  },
  { 
    id: 4, 
    type: 'team', 
    icon: UserPlus,
    color: 'orange',
    title: 'New team member', 
    message: 'Lisa Anderson joined your team', 
    time: '2 hours ago', 
    unread: false 
  },
  { 
    id: 5, 
    type: 'meeting', 
    icon: Calendar,
    color: 'red',
    title: 'Meeting reminder', 
    message: 'Sprint planning meeting starts in 30 minutes', 
    time: '3 hours ago', 
    unread: false 
  },
  { 
    id: 6, 
    type: 'task', 
    icon: CheckCircle,
    color: 'blue',
    title: 'Task completed', 
    message: 'Mike Chen completed "Implement payment gateway"', 
    time: '5 hours ago', 
    unread: false 
  },
  { 
    id: 7, 
    type: 'comment', 
    icon: MessageCircle,
    color: 'green',
    title: 'New comment', 
    message: 'Emma Wilson mentioned you in a comment', 
    time: '1 day ago', 
    unread: false 
  },
  { 
    id: 8, 
    type: 'update', 
    icon: AlertCircle,
    color: 'purple',
    title: 'System update', 
    message: 'New features have been added to the dashboard', 
    time: '2 days ago', 
    unread: false 
  },
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
};

export default function Notifications() {
  const { accentColor } = useAppearance();
  const [notifications, setNotifications] = useState(notificationData);
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.unread;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <DashboardLayout
      title="Notifications - Project Management"
      description="View and manage your notifications"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Notifications</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentColor }}
          >
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{notifications.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{unreadCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{notifications.filter(n => n.type === 'task').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Comments</p>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <MessageCircle size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{notifications.filter(n => n.type === 'comment').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'all' ? { backgroundColor: accentColor } : {}}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'unread' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'unread' ? { backgroundColor: accentColor } : {}}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('task')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'task' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'task' ? { backgroundColor: accentColor } : {}}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilter('comment')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'comment' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'comment' ? { backgroundColor: accentColor } : {}}
          >
            Comments
          </button>
          <button
            onClick={() => setFilter('update')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'update' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'update' ? { backgroundColor: accentColor } : {}}
          >
            Updates
          </button>
          <button
            onClick={() => setFilter('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'team' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'team' ? { backgroundColor: accentColor } : {}}
          >
            Team
          </button>
          <button
            onClick={() => setFilter('meeting')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'meeting' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            style={filter === 'meeting' ? { backgroundColor: accentColor } : {}}
          >
            Meetings
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    notification.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[notification.color]}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-sm ${notification.unread ? 'font-bold text-gray-800 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">{notification.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        {notification.unread && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs font-medium hover:opacity-80 transition-opacity"
                            style={{ color: accentColor }}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400 dark:text-gray-500" size={40} />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
