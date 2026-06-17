import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pause, RotateCcw, Download, Settings } from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';
import { hexToRgba } from '@/utils/colors';

export default function TimeTracker() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef(null);
  const { accentColor } = useAppearance();

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
    <div 
      className="lg:col-span-4 rounded-3xl p-6 relative overflow-hidden text-white flex flex-col justify-between min-h-[250px]"
      style={{ backgroundColor: accentColor }}
    >
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl -mr-10 -mt-10 pointer-events-none" style={{ backgroundColor: accentColor }}></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl -ml-10 -mb-10 pointer-events-none" style={{ backgroundColor: accentColor }}></div>
      
      {/* Abstract Waves/Ribbons (SVG) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,100 Q150,200 300,100 T600,100" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
        />
        <path 
          d="M0,120 Q150,220 300,120 T600,120" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          opacity="0.7"
        />
        <path 
          d="M0,140 Q150,240 300,140 T600,140" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          opacity="0.5"
        />
      </svg>
      
      <div className="relative z-20 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">Time Tracker</span>
        <div className="relative z-30" ref={menuRef}>
          <button
            onClick={() => {
              if (menuOpen) {
                closeWithAnimation();
              } else {
                setMenuOpen(true);
                setMenuClosing(false);
              }
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MoreHorizontal size={18} className="text-gray-400" />
          </button>

          {(menuOpen || menuClosing) && (
            <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-[100] origin-top-right ${
              menuClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
            }`}>
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left">
                  <RotateCcw size={16} />
                  <span className="text-sm">Reset Timer</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left">
                  <Download size={16} />
                  <span className="text-sm">Export Report</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left">
                  <Settings size={16} />
                  <span className="text-sm">Timer Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative z-10 text-center my-4">
        <span className="text-4xl font-mono font-medium tracking-wider">01:24:08</span>
      </div>
      
      <div className="relative z-10 flex justify-center gap-4">
        <button className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800 text-black dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg">
          <Pause size={20} fill="currentColor" />
        </button>
        <button className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </button>
      </div>
    </div>
  );
}
