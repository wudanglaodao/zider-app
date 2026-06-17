import { teamMembers } from '@/data/mockData';

export default function TeamCollaboration({ onAddMember }) {
  return (
    <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">Team Collaboration</h3>
        <button 
          onClick={onAddMember}
          className="text-xs border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
        >
          + Add Member
        </button>
      </div>
      
      <div className="space-y-4">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-10 h-10 rounded-full object-cover" 
              />
              <div>
                <h5 className="font-semibold text-sm text-gray-800">{member.name}</h5>
                <p className="text-[11px] text-gray-400 truncate max-w-[150px]">
                  {member.role}
                </p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${member.statusColor}`}>
              {member.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
