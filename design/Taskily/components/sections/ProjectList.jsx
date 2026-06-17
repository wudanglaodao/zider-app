import { Code, UserPlus, LayoutDashboard, Zap, Globe } from 'lucide-react';
import { projects } from '@/data/mockData';

const projectIcons = {
  'Develop API Endpoints': Code,
  'Onboarding Flow': UserPlus,
  'Build Dashboard': LayoutDashboard,
  'Optimize Page Load': Zap,
  'Cross-Browser Testing': Globe,
};

export default function ProjectList({ onNewProject }) {
  return (
    <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">Project</h3>
        <button 
          onClick={onNewProject}
          className="text-xs border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          + New
        </button>
      </div>
      
      <div className="space-y-5">
        {projects.map((proj, idx) => {
          const Icon = projectIcons[proj.title] || Code;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div className={`mt-1 min-w-[32px] h-8 rounded-lg flex items-center justify-center ${proj.iconColor}`}>
                <Icon size={16} />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-gray-800">{proj.title}</h5>
                <p className="text-[11px] text-gray-400">{proj.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
