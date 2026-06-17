export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  border = true,
  shadow = false,
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white rounded-xl
        ${border ? 'border border-gray-100' : ''}
        ${shadow ? 'shadow-lg' : ''}
        ${hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
