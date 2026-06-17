import { ArrowUpRight } from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function StatCard({ title, value, subtext, trend, active }) {
  const { accentColor } = useAppearance();

  // Helper function to adjust color brightness
  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const hoverColor = adjustColor(accentColor, 20);

  return (
    <div 
      className={`p-5 rounded-3xl transition-all cursor-pointer hover:shadow-xl ${
        active 
          ? 'text-white shadow-lg' 
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700'
      }`}
      style={active ? {
        backgroundColor: accentColor,
        boxShadow: `0 10px 25px -5px ${accentColor}33`
      } : {}}
      onMouseEnter={(e) => {
        if (active) {
          e.currentTarget.style.backgroundColor = hoverColor;
        } else {
          e.currentTarget.style.borderColor = accentColor;
        }
      }}
      onMouseLeave={(e) => {
        if (active) {
          e.currentTarget.style.backgroundColor = accentColor;
        } else {
          e.currentTarget.style.borderColor = '';
        }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-sm ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          active 
            ? 'bg-white/20' 
            : 'bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600'
        }`}>
          <ArrowUpRight size={16} className={active ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-4xl font-semibold">{value}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${
          active 
            ? 'bg-white/20 text-white' 
            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        }`}>
          {trend}
        </span>
        <span className={`text-xs ${active ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
          {subtext}
        </span>
      </div>
    </div>
  );
}
