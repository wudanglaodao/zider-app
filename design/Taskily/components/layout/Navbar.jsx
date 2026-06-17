import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import EmailDropdown from './EmailDropdown';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ toggleSidebar }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileClosing, setProfileClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const emailDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const profileRef = useRef(null);

  const closeWithAnimation = (setter, closingSetter) => {
    closingSetter(true);
    setTimeout(() => {
      setter(false);
      closingSetter(false);
    }, 200); // Match animation duration
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        closeWithAnimation(setProfileOpen, setProfileClosing);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        setSearchClosing(false);
      }
      if (e.key === 'Escape') {
        if (searchOpen) closeWithAnimation(setSearchOpen, setSearchClosing);
        if (profileOpen) closeWithAnimation(setProfileOpen, setProfileClosing);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, profileOpen]);

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden p-2 bg-white rounded-lg shadow-sm"
          >
            <Menu size={20} />
          </button>
          
          {/* Search Bar - Desktop */}
          <button
            onClick={() => {
              setSearchOpen(true);
              setSearchClosing(false);
            }}
            className="relative flex-1 max-w-md text-left hidden min-[425px]:block"
          >
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              size={18} 
            />
            <div className="w-full pl-10 pr-12 py-3 bg-white rounded-full text-sm shadow-sm border-none cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-gray-400">Search task</span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                ⌘ F
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Button - Mobile */}
          <button
            onClick={() => {
              setSearchOpen(true);
              setSearchClosing(false);
            }}
            className="p-2.5 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-all duration-200 hover:shadow-md min-[425px]:hidden"
          >
            <Search size={18} />
          </button>
          {/* Email Dropdown */}
          <EmailDropdown 
            ref={emailDropdownRef}
            onOpen={() => {
              setProfileOpen(false);
              setProfileClosing(false);
            }}
          />
          
          {/* Notification Dropdown */}
          <NotificationDropdown 
            ref={notificationDropdownRef}
            onOpen={() => {
              setProfileOpen(false);
              setProfileClosing(false);
            }}
          />
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                if (profileOpen) {
                  closeWithAnimation(setProfileOpen, setProfileClosing);
                } else {
                  // Open profile
                  setProfileOpen(true);
                  setProfileClosing(false);
                }
              }}
              className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="https://i.pravatar.cc/150?u=8" 
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-800">Totok Michael</p>
                <p className="text-xs text-gray-400">tmichael20@mail.com</p>
              </div>
            </button>

            {(profileOpen || profileClosing) && (
              <div className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 origin-top-right ${
                profileClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
              }`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Totok Michael</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">tmichael20@mail.com</p>
                </div>
                <div className="py-2">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                    <User size={18} />
                    <span className="text-sm">My Profile</span>
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <Link href="/" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors">
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {(searchOpen || searchClosing) && (
        <div 
          className={`fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-start justify-center pt-20 px-4 ${
            searchClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          onClick={() => closeWithAnimation(setSearchOpen, setSearchClosing)}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl ${
              searchClosing ? 'animate-modalSlideOut' : 'animate-modalSlideIn'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks, projects, or team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-12 pr-12 py-3 text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => closeWithAnimation(setSearchOpen, setSearchClosing)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {searchQuery ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Search results for "{searchQuery}"</p>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-150">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Design new landing page</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Task • Website Redesign</p>
                  </div>
                  <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-150">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Website Redesign</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Project • 12 tasks</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Start typing to search...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
