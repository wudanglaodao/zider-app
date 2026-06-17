import { Clock } from 'lucide-react';

export default function EventList({ selectedDate, events = [], allEvents = [] }) {
  const getEventsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const todayEvents = getEventsForDate(selectedDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-5">
        {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
      </h3>
      
      {todayEvents.length > 0 ? (
        <div className="space-y-3">
          {todayEvents.map((event) => (
            <div key={event.id} className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-1 h-12 ${event.color} rounded-full`}></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 truncate">{event.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span>{event.time}</span>
                  </div>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-gray-300 dark:text-gray-600" size={24} />
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">No events scheduled</p>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Upcoming</h4>
        <div className="space-y-3">
          {allEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-center gap-3 text-sm group cursor-pointer">
              <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{event.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
