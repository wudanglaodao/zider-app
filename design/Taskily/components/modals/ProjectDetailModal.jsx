import { useState, useEffect } from 'react';
import { X, Calendar, Users, TrendingUp, CheckCircle, Clock, Tag } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function ProjectDetailModal({ isOpen, onClose, project }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  if (!isOpen && !isClosing) return null;
  if (!project) return null;

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

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${
          isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
        }`}
        onClick={handleClose}
      ></div>

      {/* Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-2xl z-[101] transform transition-all duration-400 ease-out overflow-y-auto ${
        isClosing ? 'animate-slideOutRight' : 'animate-slideInRight'
      }`}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Project Details</h2>
            <p className="text-sm text-gray-500">View project information</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <Badge variant={statusConfig[project.status].variant}>
              {statusConfig[project.status].label}
            </Badge>
            <Badge variant={priorityConfig[project.priority].variant}>
              {priorityConfig[project.priority].label}
            </Badge>
          </div>

          {/* Progress */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Progress</span>
              </div>
              <span className="text-lg font-bold text-gray-800">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[#0f4c3a] h-3 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Tasks</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-800">{project.tasks.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-gray-400">/</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{project.tasks.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-gray-600">
                  {project.tasks.total - project.tasks.completed} remaining
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Timeline</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">End Date</span>
                <span className="text-sm font-medium text-gray-800">
                  {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Team Members</span>
            </div>
            <div className="space-y-2">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <img 
                    src={`https://i.pravatar.cc/40?u=${member}`} 
                    alt={member}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-700">{member}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                handleClose();
                // Trigger edit project modal after close animation
                setTimeout(() => {
                  if (window.openEditProject) {
                    window.openEditProject(project);
                  }
                }, 400);
              }}
              className="flex-1 bg-[#0f4c3a] text-white py-2.5 rounded-lg font-medium hover:bg-[#165f4a] transition-colors"
            >
              Edit Project
            </button>
            <button 
              onClick={() => {
                handleClose();
                // Navigate to tasks page with project filter
                setTimeout(() => {
                  window.location.href = `/dashboard/tasks?project=${encodeURIComponent(project.name)}`;
                }, 400);
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              View Tasks
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
