import { Search } from 'lucide-react';

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '' 
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      />
    </div>
  );
}
