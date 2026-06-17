import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsData } from '@/data/mockData';
import { useAppearance } from '@/contexts/AppearanceContext';

export default function AnalyticsChart() {
  const { accentColor } = useAppearance();
  
  return (
    <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="mb-6">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Project Analytics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Weekly project completion overview</p>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#f0f0f0" 
            />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
              dy={10} 
            />
            <Tooltip 
              cursor={{fill: 'transparent'}} 
              contentStyle={{
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            />
            <Bar dataKey="uv" radius={[20, 20, 20, 20]} barSize={32}>
              {analyticsData.map((entry, index) => {
                if (entry.type === 'stripe') {
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill="url(#stripePattern)" 
                      stroke="#9ca3af" 
                      strokeWidth={1} 
                      strokeDasharray="4 4" 
                      fillOpacity={0.1} 
                    />
                  );
                }
                if (entry.name === 'T' && entry.uv === 50) {
                  return <Cell key={`cell-${index}`} fill="#4ade80" />;
                }
                return <Cell key={`cell-${index}`} fill={accentColor} />;
              })}
            </Bar>
            <defs>
              <pattern 
                id="stripePattern" 
                patternUnits="userSpaceOnUse" 
                width="4" 
                height="4"
              >
                <path 
                  d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
                  stroke="#9ca3af" 
                  strokeWidth="1" 
                />
              </pattern>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Planned</span>
        </div>
      </div>
    </div>
  );
}
