export default function Textarea({
  label,
  error,
  helperText,
  required = false,
  rows = 4,
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
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2.5 border rounded-lg resize-none
          focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
          disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
          bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}
