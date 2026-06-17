import SearchBar from './SearchBar';
import FilterTabs from './FilterTabs';

export default function FilterBar({ 
  searchValue, 
  onSearchChange, 
  searchPlaceholder = 'Search...', 
  tabs, 
  activeTab, 
  onTabChange,
  className = '' 
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar 
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="flex-1"
        />
        {tabs && tabs.length > 0 && (
          <FilterTabs 
            tabs={tabs}
            activeTab={activeTab}
            onChange={onTabChange}
          />
        )}
      </div>
    </div>
  );
}
