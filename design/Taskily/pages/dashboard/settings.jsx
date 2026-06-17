import { useState } from 'react';
import { User, Bell, Lock, Palette, Globe, Shield, Mail, Smartphone } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, accentColor, updateTheme, updateAccentColor } = useAppearance();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    taskUpdates: true,
    projectUpdates: true,
    teamActivity: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <DashboardLayout
      title="Settings - Project Management"
      description="Manage your account settings and preferences"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: accentColor } : {}}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img 
                    src="https://i.pravatar.cc/150?u=user" 
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button 
                    className="absolute bottom-0 right-0 w-8 h-8 text-white rounded-full flex items-center justify-center hover:opacity-90 transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    <User size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mb-3">PNG, JPG up to 5MB</p>
                  <button 
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: accentColor }}
                  >
                    Upload new photo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@company.com"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    defaultValue="+1 234 567 8900"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Product manager with 5+ years of experience in tech industry."
                    className="input-base resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Save Changes
                  </button>
                  <button className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-800">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Bell className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-800">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Smartphone className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-800">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Activity Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-gray-700">Task updates</span>
                      <input
                        type="checkbox"
                        checked={notifications.taskUpdates}
                        onChange={(e) => setNotifications({ ...notifications, taskUpdates: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-gray-700">Project updates</span>
                      <input
                        type="checkbox"
                        checked={notifications.projectUpdates}
                        onChange={(e) => setNotifications({ ...notifications, projectUpdates: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span className="text-gray-700">Team activity</span>
                      <input
                        type="checkbox"
                        checked={notifications.teamActivity}
                        onChange={(e) => setNotifications({ ...notifications, teamActivity: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#0f4c3a] focus:ring-[#0f4c3a]"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input
                        type="password"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="input-base"
                      />
                    </div>
                    <button 
                      className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                      style={{ backgroundColor: accentColor }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Enable 2FA</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button 
                      className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                      style={{ backgroundColor: accentColor }}
                    >
                      Enable
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">MacBook Pro - Chrome</p>
                        <p className="text-sm text-gray-500">San Francisco, CA • Active now</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Current
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">iPhone 14 - Safari</p>
                        <p className="text-sm text-gray-500">San Francisco, CA • 2 hours ago</p>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Appearance</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      onClick={() => updateTheme('light')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors`}
                      style={{ 
                        borderColor: theme === 'light' ? accentColor : '#e5e7eb',
                      }}
                    >
                      <div className="w-full h-20 bg-white border border-gray-200 rounded mb-3"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div 
                      onClick={() => updateTheme('dark')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors`}
                      style={{ 
                        borderColor: theme === 'dark' ? accentColor : '#e5e7eb',
                      }}
                    >
                      <div className="w-full h-20 bg-gray-800 rounded mb-3"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div 
                      onClick={() => updateTheme('auto')}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors`}
                      style={{ 
                        borderColor: theme === 'auto' ? accentColor : '#e5e7eb',
                      }}
                    >
                      <div className="w-full h-20 bg-gradient-to-br from-white to-gray-800 rounded mb-3"></div>
                      <p className="text-sm font-medium text-center">Auto</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Accent Color</h3>
                  <div className="flex gap-3">
                    {['#0f4c3a', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateAccentColor(color)}
                        className={`w-10 h-10 rounded-full transition-all ${accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select className="input-base">
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Indonesian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                  <select className="input-base">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>Central Time (CT)</option>
                    <option>Mountain Time (MT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                  <select className="input-base">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
