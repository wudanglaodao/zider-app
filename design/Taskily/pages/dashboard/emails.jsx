import { useState } from 'react';
import { Search, Star, Archive, Trash2, MoreVertical, Paperclip, Reply, Forward } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppearance } from '@/contexts/AppearanceContext';

const emailData = [
  { 
    id: 1, 
    from: 'Sarah Johnson', 
    email: 'sarah.j@company.com',
    subject: 'Project Update - Website Redesign', 
    preview: 'Hi team, I wanted to share the latest updates on the website redesign project. We\'ve completed the homepage design and it\'s ready for review...', 
    body: 'Hi team,\n\nI wanted to share the latest updates on the website redesign project. We\'ve completed the homepage design and it\'s ready for review. Please take a look and share your feedback by end of day.\n\nBest regards,\nSarah',
    time: '5 minutes ago', 
    unread: true,
    starred: false,
    hasAttachment: true
  },
  { 
    id: 2, 
    from: 'Mike Chen', 
    email: 'mike.c@company.com',
    subject: 'Meeting Tomorrow at 10 AM', 
    preview: 'Don\'t forget about our sprint planning meeting tomorrow at 10 AM. We\'ll be discussing the roadmap for Q1...', 
    body: 'Hi everyone,\n\nDon\'t forget about our sprint planning meeting tomorrow at 10 AM. We\'ll be discussing the roadmap for Q1 and prioritizing features.\n\nSee you there!\nMike',
    time: '1 hour ago', 
    unread: true,
    starred: true,
    hasAttachment: false
  },
  { 
    id: 3, 
    from: 'Emma Wilson', 
    email: 'emma.w@company.com',
    subject: 'Task Completed - Authentication Module', 
    preview: 'I\'ve finished implementing the authentication module with OAuth support. All tests are passing...', 
    body: 'Hi,\n\nI\'ve finished implementing the authentication module with OAuth support. All tests are passing and the code is ready for review.\n\nThanks,\nEmma',
    time: '3 hours ago', 
    unread: false,
    starred: false,
    hasAttachment: false
  },
  { 
    id: 4, 
    from: 'John Doe', 
    email: 'john.d@company.com',
    subject: 'Code Review Request - PR #234', 
    preview: 'Could you please review my pull request for the payment gateway integration? It includes...', 
    body: 'Hi,\n\nCould you please review my pull request for the payment gateway integration? It includes Stripe and PayPal support.\n\nThanks,\nJohn',
    time: '5 hours ago', 
    unread: false,
    starred: false,
    hasAttachment: true
  },
  { 
    id: 5, 
    from: 'Alex Brown', 
    email: 'alex.b@company.com',
    subject: 'Bug Report - Mobile App Crash', 
    preview: 'I found a critical bug in the mobile app that causes crashes on iOS devices...', 
    body: 'Hi team,\n\nI found a critical bug in the mobile app that causes crashes on iOS devices when users try to upload images. This needs immediate attention.\n\nBest,\nAlex',
    time: '1 day ago', 
    unread: false,
    starred: true,
    hasAttachment: false
  },
];

export default function Emails() {
  const { accentColor } = useAppearance();
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredEmails = emailData.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && email.unread) ||
                         (filter === 'starred' && email.starred);
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout
      title="Emails - Project Management"
      description="Manage your emails and messages"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Emails</h1>
          <p className="text-gray-500 text-sm">Manage your messages and communications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={filter === 'all' ? { backgroundColor: accentColor } : {}}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'unread' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={filter === 'unread' ? { backgroundColor: accentColor } : {}}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('starred')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'starred' ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={filter === 'starred' ? { backgroundColor: accentColor } : {}}
              >
                Starred
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="overflow-y-auto max-h-[600px]">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 border-b border-gray-50 dark:border-gray-700 cursor-pointer transition-colors ${
                  selectedEmail?.id === email.id ? 'border-l-4' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${email.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                style={selectedEmail?.id === email.id ? { 
                  backgroundColor: `${accentColor}15`,
                  borderLeftColor: accentColor 
                } : {}}
              >
                <div className="flex items-start gap-3">
                  <img 
                    src={`https://i.pravatar.cc/40?u=${email.id}`} 
                    alt={email.from}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm truncate ${email.unread ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                        {email.from}
                      </p>
                      <div className="flex items-center gap-1">
                        {email.starred && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                        {email.hasAttachment && <Paperclip size={14} className="text-gray-400" />}
                      </div>
                    </div>
                    <p className={`text-sm mb-1 truncate ${email.unread ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{email.preview}</p>
                    <p className="text-xs text-gray-400 mt-1">{email.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={`https://i.pravatar.cc/50?u=${selectedEmail.id}`} 
                      alt={selectedEmail.from}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedEmail.subject}</h2>
                      <p className="text-sm text-gray-600">{selectedEmail.from} &lt;{selectedEmail.email}&gt;</p>
                      <p className="text-xs text-gray-400 mt-1">{selectedEmail.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Star size={18} className={selectedEmail.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Archive size={18} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Trash2 size={18} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="mb-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{selectedEmail.body}</p>
                </div>
                
                {selectedEmail.hasAttachment && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Paperclip size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">document.pdf</p>
                        <p className="text-xs text-gray-500">2.4 MB</p>
                      </div>
                      <button 
                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: accentColor }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                >
                  <Reply size={18} />
                  Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Forward size={18} />
                  Forward
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={40} />
                </div>
                <p className="text-gray-500">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
