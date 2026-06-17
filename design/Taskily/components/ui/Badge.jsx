const variants = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
  primary: 'bg-accent text-white',
  success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
  warning: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}
