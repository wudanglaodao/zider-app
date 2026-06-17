import Link from 'next/link';

export default function SidebarItem({ icon: Icon, label, active, count, href = '#' }) {
  return (
    <Link href={href}>
      <div 
        className={`flex items-center justify-between px-4 py-3 mb-1 rounded-xl cursor-pointer transition-colors ${
          active 
            ? 'text-accent font-semibold bg-white dark:bg-gray-800 shadow-sm' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={active ? "text-accent" : "text-gray-400 dark:text-gray-500"} />
          <span>{label}</span>
        </div>
        {count && (
          <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}
