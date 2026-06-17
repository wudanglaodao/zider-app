import { useAppearance } from '@/contexts/AppearanceContext';

export default function FilterTabs({ tabs, activeTab, onChange, className = '' }) {
  const { accentColor } = useAppearance();

  return (
    <div className={`flex gap-2 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
            activeTab === tab.value 
              ? 'text-white' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          style={activeTab === tab.value ? { backgroundColor: accentColor } : {}}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
