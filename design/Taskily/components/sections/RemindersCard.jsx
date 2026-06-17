import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Video, Edit, Trash2, Bell } from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function RemindersCard() {
  const { accentColor } = useAppearance();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef(null);

  const closeWithAnimation = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        closeWithAnimation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Reminders</h3>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              if (menuOpen) {
                closeWithAnimation();
              } else {
                setMenuOpen(true);
                setMenuClosing(false);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>

          {(menuOpen || menuClosing) && (
            <div className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 origin-top-right ${
              menuClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
            }`}>
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <Edit size={16} />
                  <span className="text-sm">Edit Reminder</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <Bell size={16} />
                  <span className="text-sm">Snooze</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-red-600 transition-colors text-left">
                  <Trash2 size={16} />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h4 className="text-xl font-bold text-gray-800 leading-tight mb-2">
          Meeting with Arc Company
        </h4>
        <p className="text-gray-400 text-sm mb-3">
          Time: 02.00 pm - 04.00 pm
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Discuss project requirements and timeline for the new website redesign. Review mockups and finalize deliverables.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/32?u=1" alt="Attendee" className="w-7 h-7 rounded-full border-2 border-white" />
            <img src="https://i.pravatar.cc/32?u=2" alt="Attendee" className="w-7 h-7 rounded-full border-2 border-white" />
            <img src="https://i.pravatar.cc/32?u=3" alt="Attendee" className="w-7 h-7 rounded-full border-2 border-white" />
          </div>
          <span className="text-xs text-gray-500">+3 attendees</span>
        </div>
      </div>
      
      <button 
        className="w-full text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
        style={{ backgroundColor: accentColor }}
      >
        <Video size={18} /> Start Meeting
      </button>
    </div>
  );
}
