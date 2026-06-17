export default function PageHeader({ 
  title, 
  description, 
  actions = [], 
  className = '' 
}) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1">{title}</h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
        )}
      </div>
      {actions.length > 0 && (
        <div className="flex gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={action.className || 'btn-primary'}
              style={action.style}
            >
              {action.icon && <action.icon size={16} />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
