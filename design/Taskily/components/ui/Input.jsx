export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  required = false,
  className = '',
  containerClassName = '',
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
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        )}
        <input
          className={`
            w-full px-4 py-2.5 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
            border-gray-200 dark:border-gray-600
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'}
            ${className}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}
