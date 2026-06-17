import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { progressData } from '@/data/mockData';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function ProjectProgress() {
  const { accentColor } = useAppearance();
  
  // Update progressData with dynamic accent color
  const dynamicProgressData = progressData.map(item => {
    if (item.name === 'Completed') {
      return { ...item, color: accentColor };
    }
    return item;
  });
  
  return (
    <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">Project Progress</h3>
      
      <div className="h-48 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dynamicProgressData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {dynamicProgressData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  cornerRadius={10} 
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-4">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">41%</span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Project Ended</p>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <span className="text-gray-500 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <span className="text-gray-500 dark:text-gray-400">Remaining</span>
        </div>
      </div>
    </div>
  );
}
