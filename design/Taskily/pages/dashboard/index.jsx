import { useState } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsSection from '@/components/sections/StatsSection';
import AnalyticsChart from '@/components/sections/AnalyticsChart';
import RemindersCard from '@/components/sections/RemindersCard';
import ProjectList from '@/components/sections/ProjectList';
import TeamCollaboration from '@/components/sections/TeamCollaboration';
import ProjectProgress from '@/components/sections/ProjectProgress';
import TimeTracker from '@/components/sections/TimeTracker';
import AddProjectModal from '@/components/modals/AddProjectModal';
import AddMemberModal from '@/components/modals/AddMemberModal';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function Dashboard() {
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const { accentColor } = useAppearance();

  const handleCreateProject = (projectData) => {
    // Handle project creation
    console.log('Creating project:', projectData);
    setShowAddProject(false);
    // You can add API call here or update state
  };

  const handleAddMember = (memberData) => {
    // Handle member invitation
    console.log('Adding member:', memberData);
    setShowAddMember(false);
    // You can add API call here or update state
  };

  return (
    <DashboardLayout
      title="Dashboard - Project Management"
      description="Plan, prioritize, and accomplish your tasks with ease. Track your projects, team collaboration, and analytics in one place."
    >
      {/* Dashboard Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddProject(true)}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={16} /> Add Project
          </button>
          <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
            Import Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsSection />

      {/* Middle Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <AnalyticsChart />
        <RemindersCard />
        <ProjectList onNewProject={() => setShowAddProject(true)} />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TeamCollaboration onAddMember={() => setShowAddMember(true)} />
        <ProjectProgress />
        <TimeTracker />
      </div>

      {/* Add Project Modal */}
      <AddProjectModal 
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSubmit={handleCreateProject}
      />

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddMember}
      />
    </DashboardLayout>
  );
}
