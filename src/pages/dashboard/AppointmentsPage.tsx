import { useState } from 'react';
import { Calendar, Clock, Filter, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAppointments } from '@/data/mockData';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week' | 'month';

const AppointmentsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter(apt => isSameDay(apt.date, date));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[hsl(var(--status-confirmed))] border-[hsl(var(--status-confirmed))]';
      case 'pending': return 'bg-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]';
      case 'cancelled': return 'bg-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled))]';
      case 'completed': return 'bg-[hsl(var(--status-completed))] border-[hsl(var(--status-completed))]';
      default: return 'bg-muted';
    }
  };

  const filteredAppointments = mockAppointments.filter(apt =>
    apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors capitalize",
                  viewMode === mode 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Week View Calendar */}
      {viewMode === 'week' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-4 text-center border-r border-border">
              <Clock className="h-5 w-5 text-muted-foreground mx-auto" />
            </div>
            {weekDays.map((day, index) => (
              <div 
                key={index}
                className={cn(
                  "p-4 text-center border-r border-border last:border-r-0",
                  isSameDay(day, new Date()) && "bg-primary/5"
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">{format(day, 'EEE')}</p>
                <p className={cn(
                  "text-lg font-semibold",
                  isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="max-h-[600px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                <div className="p-4 text-center border-r border-border text-sm text-muted-foreground">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = getAppointmentsForDate(day).filter(apt => {
                    const aptHour = parseInt(apt.startTime.split(':')[0]);
                    return aptHour === hour;
                  });

                  return (
                    <div 
                      key={dayIndex}
                      className={cn(
                        "p-2 border-r border-border last:border-r-0 min-h-[80px]",
                        isSameDay(day, new Date()) && "bg-primary/5"
                      )}
                    >
                      {dayAppointments.map(apt => (
                        <div
                          key={apt.id}
                          className={cn(
                            "rounded-lg p-2 mb-1 text-xs border-l-4 bg-card shadow-sm cursor-pointer hover:shadow-md transition-shadow",
                            getStatusClass(apt.status)
                          )}
                        >
                          <p className="font-medium text-foreground truncate">{apt.clientName}</p>
                          <p className="text-muted-foreground truncate">{apt.serviceName}</p>
                          <p className="text-muted-foreground">{apt.startTime} - {apt.endTime}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {getAppointmentsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments for this day</p>
              </div>
            ) : (
              getAppointmentsForDate(selectedDate).map(apt => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-semibold text-foreground">{apt.startTime}</p>
                    <p className="text-sm text-muted-foreground">{apt.endTime}</p>
                  </div>
                  <div className={cn("w-1 h-12 rounded-full", getStatusClass(apt.status))} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{apt.clientName}</p>
                    <p className="text-sm text-muted-foreground">{apt.serviceName} • {apt.staffName}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize",
                      apt.status === 'confirmed' && 'status-confirmed',
                      apt.status === 'pending' && 'status-pending',
                      apt.status === 'cancelled' && 'status-cancelled',
                      apt.status === 'completed' && 'status-completed'
                    )}>
                      {apt.status}
                    </span>
                    <p className="text-sm font-medium text-foreground mt-1">${apt.price}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Month View (simplified) */}
      {viewMode === 'month' && (
        <div className="glass-card rounded-2xl p-6">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Month view coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              Switch to Day or Week view for full functionality
            </p>
          </div>
        </div>
      )}

      {/* Appointment List */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6">All Appointments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Service</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Staff</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(apt => (
                <tr key={apt.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium text-foreground">{apt.clientName}</td>
                  <td className="p-4 text-muted-foreground">{apt.serviceName}</td>
                  <td className="p-4 text-muted-foreground">{apt.staffName}</td>
                  <td className="p-4 text-muted-foreground">{format(apt.date, 'MMM d, yyyy')}</td>
                  <td className="p-4 text-muted-foreground">{apt.startTime}</td>
                  <td className="p-4">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize",
                      apt.status === 'confirmed' && 'status-confirmed',
                      apt.status === 'pending' && 'status-pending',
                      apt.status === 'cancelled' && 'status-cancelled',
                      apt.status === 'completed' && 'status-completed'
                    )}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-foreground">${apt.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
