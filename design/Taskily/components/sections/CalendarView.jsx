import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppearance } from '@/contexts/AppearanceContext';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ 
  currentDate, 
  selectedDate, 
  onDateSelect, 
  onPrevMonth, 
  onNextMonth,
  events = []
}) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const days = getDaysInMonth(currentDate);
  const { accentColor } = useAppearance();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          const dayEvents = day ? getEventsForDate(day) : [];
          return (
            <div
              key={index}
              onClick={() => day && onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-center cursor-pointer transition-all ${
                !day ? 'invisible' : ''
              } ${
                isToday(day) ? 'text-white font-bold shadow-md' : ''
              } ${
                isSelected(day) && !isToday(day) ? 'font-semibold ring-2 ring-opacity-30' : ''
              } ${
                !isToday(day) && !isSelected(day) ? 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300' : ''
              }`}
              style={
                isToday(day) 
                  ? { backgroundColor: accentColor } 
                  : isSelected(day) && !isToday(day) 
                    ? { 
                        backgroundColor: `${accentColor}15`, 
                        color: accentColor, 
                        borderColor: accentColor 
                      } 
                    : {}
              }
            >
              <div className="text-sm font-medium">{day}</div>
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-1 mt-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${isToday(day) ? 'bg-white' : event.color}`}></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
