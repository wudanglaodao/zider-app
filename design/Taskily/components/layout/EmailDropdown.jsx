import { useState, useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';

const emails = [
  { id: 1, from: 'Sarah Johnson', subject: 'Project Update', preview: 'The new design is ready for review...', time: '5m ago', unread: true },
  { id: 2, from: 'Mike Chen', subject: 'Meeting Tomorrow', preview: 'Don\'t forget about our meeting at 10 AM...', time: '1h ago', unread: true },
  { id: 3, from: 'Emma Wilson', subject: 'Task Completed', preview: 'I\'ve finished the authentication module...', time: '3h ago', unread: false },
];

export default function EmailDropdown({ onOpen }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailClosing, setEmailClosing] = useState(false);
  const emailRef = useRef(null);

  const closeWithAnimation = () => {
    setEmailClosing(true);
    setTimeout(() => {
      setEmailOpen(false);
      setEmailClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailOpen && emailRef.current && !emailRef.current.contains(event.target)) {
        closeWithAnimation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [emailOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && emailOpen) {
        closeWithAnimation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [emailOpen]);

  const handleToggle = () => {
    if (emailOpen) {
      closeWithAnimation();
    } else {
      if (onOpen) onOpen();
      setEmailOpen(true);
      setEmailClosing(false);
    }
  };

  return (
    <div className="relative" ref={emailRef}>
      <button 
        onClick={handleToggle}
        className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 relative transition-all duration-200 hover:shadow-md"
      >
        <Mail size={18} />
        {emails.filter(e => e.unread).length > 0 && (
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
        )}
      </button>

      {(emailOpen || emailClosing) && (
        <div className={`absolute max-[425px]:-right-[28vw] max-[450px]:-right-[10vw] right-0 mt-2 w-80 max-[480px]:w-[calc(100vw-2rem)] max-[480px]:max-w-[320px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 origin-top-right ${
          emailClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
        }`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Messages</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{emails.filter(e => e.unread).length} unread messages</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {emails.map((email) => (
              <div key={email.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-50 dark:border-gray-700 transition-colors duration-150 ${email.unread ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-start gap-3">
                  <img src={`https://i.pravatar.cc/40?u=${email.id}`} alt={email.from} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm ${email.unread ? 'font-semibold text-gray-800 dark:text-gray-200' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                        {email.from}
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{email.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{email.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/emails" className="block p-3 text-center text-sm text-accent hover:bg-gray-50 dark:hover:bg-gray-700 font-medium border-t border-gray-100 dark:border-gray-700">
            View All Messages
          </Link>
        </div>
      )}
    </div>
  );
}
