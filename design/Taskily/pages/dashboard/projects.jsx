import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, Search, MoreVertical, Users, Calendar, TrendingUp, Edit, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddProjectModal from '@/components/modals/AddProjectModal';
import ProjectDetailModal from '@/components/modals/ProjectDetailModal';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { useAppearance } from '@/contexts/AppearanceContext';

const projectData = [
  { 
    id: 1, 
    name: 'Website Redesign', 
    description: 'Complete redesign of company website with modern UI/UX',
    status: 'running', 
    priority: 'high',
    progress: 75,
    startDate: '2024-11-01',
    endDate: '2024-12-15',
    team: ['Sarah Johnson', 'Mike Chen', 'Emma Wilson'],
    tasks: { total: 24, completed: 18 }
  },
  { 
    id: 2, 
    name: 'Mobile App Development', 
    description: 'iOS and Android app for customer engagement',
    status: 'running', 
    priority: 'critical',
    progress: 45,
    startDate: '2024-10-15',
    endDate: '2024-12-30',
    team: ['John Doe', 'Alex Brown'],
    tasks: { total: 32, completed: 14 }
  },
  { 
    id: 3, 
    name: 'API Integration', 
    description: 'Third-party API integration for payment processing',
    status: 'ended', 
    priority: 'medium',
    progress: 100,
    startDate: '2024-09-01',
    endDate: '2024-10-30',
    team: ['Mike Chen', 'John Doe'],
    tasks: { total: 16, completed: 16 }
  },
  { 
    id: 4, 
    name: 'Database Migration', 
    description: 'Migrate from MySQL to PostgreSQL',
    status: 'pending', 
    priority: 'high',
    progress: 0,
    startDate: '2024-12-01',
    endDate: '2025-01-15',
    team: ['John Doe'],
    tasks: { total: 12, completed: 0 }
  },
  { 
    id: 5, 
    name: 'Security Audit', 
    description: 'Complete security audit and penetration testing',
    status: 'running', 
    priority: 'critical',
    progress: 60,
    startDate: '2024-11-10',
    endDate: '2024-12-05',
    team: ['Alex Brown', 'Sarah Johnson'],
    tasks: { total: 20, completed: 12 }
  },
  { 
    id: 6, 
    name: 'Documentation Update', 
    description: 'Update all technical documentation',
    status: 'ended', 
    priority: 'low',
    progress: 100,
    startDate: '2024-10-01',
    endDate: '2024-11-15',
    team: ['Emma Wilson'],
    tasks: { total: 8, completed: 8 }
  },
];

const statusConfig = {
  running: { label: 'Running', variant: 'info' },
  ended: { label: 'Ended', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
};

const priorityConfig = {
  low: { label: 'Low', variant: 'default' },
  medium: { label: 'Medium', variant: 'info' },
  high: { label: 'High', variant: 'warning' },
  critical: { label: 'Critical', variant: 'danger' },
};

export default function Projects() {
  const router = useRouter();
  const { status: statusFilter } = router.query;
  const { accentColor } = useAppearance();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(statusFilter || 'all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRefs = useRef({});

  // Expose function to open edit modal from detail modal
  useEffect(() => {
    window.openEditProject = (project) => {
      setSelectedProject(project);
      setShowEditProject(true);
    };
    return () => {
      delete window.openEditProject;
    };
  }, []);

  const closeMenuWithAnimation = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setOpenMenuId(null);
      setMenuClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId].contains(event.target)) {
        closeMenuWithAnimation();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleCreateProject = (projectData) => {
    console.log('Creating project:', projectData);
    setShowAddProject(false);
  };

  const filteredProjects = projectData.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || project.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: projectData.length,
    running: projectData.filter(p => p.status === 'running').length,
    ended: projectData.filter(p => p.status === 'ended').length,
    pending: projectData.filter(p => p.status === 'pending').length,
  };

  return (
    <DashboardLayout
      title="Projects - Project Management"
      description="Manage and track all your projects"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Projects</h1>
          <p className="text-gray-500 text-sm">Manage and track all your projects</p>
        </div>
        <button 
          onClick={() => setShowAddProject(true)}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stats Cards - Minimalist Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setFilter('all')}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Total Projects</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <TrendingUp className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setFilter('running')}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Running</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.running}</p>
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <TrendingUp className="text-blue-500 dark:text-blue-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setFilter('ended')}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ended</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ended}</p>
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <TrendingUp className="text-green-500 dark:text-green-400" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setFilter('pending')}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Pending</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <TrendingUp className="text-orange-500 dark:text-orange-400" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all' ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={filter === 'all' ? { backgroundColor: accentColor } : {}}
            >
              All
            </button>
            <button
              onClick={() => setFilter('running')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'running' ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={filter === 'running' ? { backgroundColor: accentColor } : {}}
            >
              Running
            </button>
            <button
              onClick={() => setFilter('ended')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'ended' ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={filter === 'ended' ? { backgroundColor: accentColor } : {}}
            >
              Ended
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'pending' ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={filter === 'pending' ? { backgroundColor: accentColor } : {}}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} padding="md" className="relative">
            <div 
              className="cursor-pointer"
              onClick={() => {
                setSelectedProject(project);
                setShowProjectDetail(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                </div>
                <div className="relative z-10" ref={el => menuRefs.current[project.id] = el}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openMenuId === project.id) {
                        closeMenuWithAnimation();
                      } else {
                        setOpenMenuId(project.id);
                        setMenuClosing(false);
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {(openMenuId === project.id || (menuClosing && openMenuId === project.id)) && (
                    <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-[100] origin-top-right ${
                      menuClosing ? 'animate-dropdownSlideOut' : 'animate-dropdownSlideIn'
                    }`}>
                      <div className="py-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setShowProjectDetail(true);
                            closeMenuWithAnimation();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left"
                        >
                          <Eye size={16} />
                          <span className="text-sm">View Details</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setShowEditProject(true);
                            closeMenuWithAnimation();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-left"
                        >
                          <Edit size={16} />
                          <span className="text-sm">Edit Project</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors text-left">
                          <Trash2 size={16} />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Badge variant={statusConfig[project.status].variant} size="sm">
                {statusConfig[project.status].label}
              </Badge>
              <Badge variant={priorityConfig[project.priority].variant} size="sm">
                {priorityConfig[project.priority].label}
              </Badge>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-gray-800">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${project.progress}%`, backgroundColor: accentColor }}
                ></div>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <span className="font-semibold text-gray-800">{project.tasks.completed}</span>
                <span>/</span>
                <span>{project.tasks.total}</span>
                <span>tasks</span>
              </div>
            </div>

            {/* Team & Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{project.team.length} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Project Modal */}
      <AddProjectModal 
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSubmit={handleCreateProject}
      />

      {/* Edit Project Modal */}
      <AddProjectModal 
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        onSubmit={(data) => {
          console.log('Updating project:', data);
          setShowEditProject(false);
        }}
        initialData={selectedProject}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal 
        isOpen={showProjectDetail}
        onClose={() => setShowProjectDetail(false)}
        project={selectedProject}
      />
    </DashboardLayout>
  );
}
