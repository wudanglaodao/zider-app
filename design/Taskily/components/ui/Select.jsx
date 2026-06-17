export default function Select({
  label,
  error,
  helperText,
  icon: Icon,
  required = false,
  options = [],
  className = '',
  containerClassName = '',
  children,
  ...props
}) {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        )}
        <select
          className={`
            w-full px-4 py-2.5 border rounded-lg appearance-none
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
            border-gray-200 dark:border-gray-600
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        >
          {children || options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}
