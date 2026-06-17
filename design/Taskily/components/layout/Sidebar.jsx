import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  BarChart2, 
  Users, 
  FolderKanban,
  Settings, 
  HelpCircle, 
  LogOut,
  X
} from 'lucide-react';
import { useRouter } from 'next/router';
import SidebarItem from '@/components/ui/SidebarItem';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const router = useRouter();
  const { accentColor } = useAppearance();
  
  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#f8f9fa] dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div 
            className="w-8 h-8 rounded-full border-4 flex items-center justify-center"
            style={{ borderColor: accentColor }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">Taskily</span>
          <button className="lg:hidden ml-auto" onClick={toggleSidebar}>
            <X size={20}/>
          </button>
        </div>

        {/* Menu */}
        <div className="space-y-6 flex-1">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 px-4">MENU</p>
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              href="/dashboard" 
              active={router.pathname === '/dashboard'} 
            />
            <SidebarItem 
              icon={FolderKanban} 
              label="Projects" 
              href="/dashboard/projects" 
              count="24" 
              active={router.pathname === '/dashboard/projects'} 
            />
            <SidebarItem 
              icon={CheckSquare} 
              label="Tasks" 
              href="/dashboard/tasks" 
              count="12+" 
              active={router.pathname === '/dashboard/tasks'} 
            />
            <SidebarItem 
              icon={Calendar} 
              label="Calendar" 
              href="/dashboard/calendar" 
              active={router.pathname === '/dashboard/calendar'} 
            />
            <SidebarItem 
              icon={BarChart2} 
              label="Analytics" 
              href="/dashboard/analytics" 
              active={router.pathname === '/dashboard/analytics'} 
            />
            <SidebarItem 
              icon={Users} 
              label="Team" 
              href="/dashboard/team" 
              active={router.pathname === '/dashboard/team'} 
            />
          </div>
          
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4 px-4">GENERAL</p>
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              href="/dashboard/settings" 
              active={router.pathname === '/dashboard/settings'} 
            />
            <SidebarItem 
              icon={HelpCircle} 
              label="Help" 
              href="/dashboard/help" 
              active={router.pathname === '/dashboard/help'} 
            />
            <SidebarItem 
              icon={LogOut} 
              label="Logout" 
              href="/" 
              active={false} 
            />
          </div>
        </div>

        {/* Promo Card */}
        <div 
          className="mt-6 relative overflow-hidden rounded-3xl p-6 text-white shadow-xl min-h-[270px]"
          style={{ 
            background: `linear-gradient(135deg, ${accentColor}dd 0%, ${accentColor} 50%, ${accentColor}cc 100%)`
          }}
        >
          {/* Decorative curved lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,80 Q60,120 120,80 T240,80" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M0,100 Q60,140 120,100 T240,100" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M0,120 Q60,160 120,120 T240,120" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M0,140 Q60,180 120,140 T240,140" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Icon with badge */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: accentColor }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h4 className="text-lg font-bold mb-1 text-white leading-tight">Download our<br/>Mobile App</h4>
            <p className="text-sm text-white/80 mb-6">Get easy in another way</p>
            
            <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] mt-auto backdrop-blur-sm">
              Download
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
