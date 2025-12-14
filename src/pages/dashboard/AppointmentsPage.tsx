import { useState } from 'react';
import { Calendar, Clock, Filter, Search, Plus, ChevronLeft, ChevronRight, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppointments, AppointmentWithDetails } from '@/hooks/useAppointments';
import { format, startOfWeek, addDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ViewMode = 'day' | '3day' | 'week' | 'month';

interface CellAction {
  date: Date;
  time: string;
}

const AppointmentsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<CellAction | null>(null);

  const { appointments, loading } = useAppointments();

  // Generate 15-minute intervals from 12:00 AM to 11:45 PM
  const timeSlots = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      display: format(new Date().setHours(hours, minutes), 'h:mm a')
    };
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const threeDays = Array.from({ length: 3 }, (_, i) => addDays(selectedDate, i));

  // Month view helpers
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return isSameDay(aptDate, date);
    });
  };

  const getAppointmentForSlot = (date: Date, time: string) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      if (!isSameDay(aptDate, date)) return false;
      
      const slotMinutes = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
      const startMinutes = parseInt(apt.start_time.split(':')[0]) * 60 + parseInt(apt.start_time.split(':')[1]);
      const endMinutes = parseInt(apt.end_time.split(':')[0]) * 60 + parseInt(apt.end_time.split(':')[1]);
      
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  const isAppointmentStart = (date: Date, time: string, apt: AppointmentWithDetails) => {
    const aptDate = parseISO(apt.appointment_date);
    if (!isSameDay(aptDate, date)) return false;
    return apt.start_time === time;
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

  const filteredAppointments = appointments.filter(apt =>
    apt.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.service_names?.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCellClick = (date: Date, time: string) => {
    setSelectedCell({ date, time });
  };

  const handleAddAppointment = () => {
    if (selectedCell) {
      console.log('Add appointment for:', selectedCell.date, selectedCell.time);
      // TODO: Open appointment dialog
    }
    setSelectedCell(null);
  };

  const handleAddNote = () => {
    if (selectedCell) {
      console.log('Add note for:', selectedCell.date, selectedCell.time);
      // TODO: Open note dialog
    }
    setSelectedCell(null);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const amount = viewMode === 'day' ? 1 : viewMode === '3day' ? 3 : viewMode === 'week' ? 7 : 0;
    if (viewMode === 'month') {
      setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, direction === 'prev' ? -amount : amount));
    }
  };

  const getDaysForView = () => {
    switch (viewMode) {
      case 'day': return [selectedDate];
      case '3day': return threeDays;
      case 'week': return weekDays;
      default: return weekDays;
    }
  };

  const getGridCols = () => {
    switch (viewMode) {
      case 'day': return 'grid-cols-2';
      case '3day': return 'grid-cols-4';
      case 'week': return 'grid-cols-8';
      default: return 'grid-cols-8';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ActionPopover = ({ date, time, children }: { date: Date; time: string; children: React.ReactNode }) => (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1 border-b border-border mb-2">
            {format(date, 'MMM d')} at {format(new Date().setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1])), 'h:mm a')}
          </p>
          <button
            onClick={handleAddAppointment}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Appointment
          </button>
          <button
            onClick={handleAddNote}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <FileText className="h-4 w-4" />
            Add Note
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4 animate-fade-in">
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
            {(['day', '3day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors",
                  viewMode === mode 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {mode === '3day' ? '3 Day' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between glass-card rounded-xl p-3">
        <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h2 className="font-serif text-lg font-semibold text-foreground">
            {viewMode === 'month' 
              ? format(selectedDate, 'MMMM yyyy')
              : viewMode === 'day'
              ? format(selectedDate, 'EEEE, MMMM d, yyyy')
              : viewMode === '3day'
              ? `${format(selectedDate, 'MMM d')} - ${format(addDays(selectedDate, 2), 'MMM d, yyyy')}`
              : `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
            }
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid View (Day, 3 Day, Week) */}
      {viewMode !== 'month' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Header with days */}
          <div className={cn("grid border-b border-border", getGridCols())}>
            <div className="p-3 text-center border-r border-border bg-muted/30">
              <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
            </div>
            {getDaysForView().map((day, index) => (
              <div 
                key={index}
                className={cn(
                  "p-3 text-center border-r border-border last:border-r-0",
                  isSameDay(day, new Date()) && "bg-primary/10"
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">{format(day, 'EEE')}</p>
                <p className={cn(
                  "text-xl font-semibold",
                  isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            {timeSlots.map((slot, slotIndex) => (
              <div key={slot.time} className={cn("grid border-b border-border/50 last:border-b-0", getGridCols())}>
                <div className={cn(
                  "p-1 text-center border-r border-border text-xs text-muted-foreground bg-muted/20",
                  slotIndex % 4 === 0 ? "font-medium" : "text-muted-foreground/60"
                )}>
                  {slotIndex % 4 === 0 ? slot.display : ''}
                </div>
                {getDaysForView().map((day, dayIndex) => {
                  const slotAppointments = getAppointmentForSlot(day, slot.time);
                  const hasAppointment = slotAppointments.length > 0;
                  const appointmentStart = slotAppointments.find(apt => isAppointmentStart(day, slot.time, apt));

                  return (
                    <ActionPopover key={dayIndex} date={day} time={slot.time}>
                      <div 
                        className={cn(
                          "min-h-[24px] border-r border-border/50 last:border-r-0 cursor-pointer transition-colors relative",
                          isSameDay(day, new Date()) && "bg-primary/5",
                          !hasAppointment && "hover:bg-muted/50",
                          slotIndex % 4 === 0 && "border-t border-border/30"
                        )}
                      >
                        {appointmentStart && (
                          <div
                            className={cn(
                              "absolute left-0.5 right-0.5 rounded p-1 text-xs border-l-2 bg-card shadow-sm z-10",
                              getStatusClass(appointmentStart.status)
                            )}
                            style={{
                              height: `${(appointmentStart.total_duration / 15) * 24}px`,
                              minHeight: '24px'
                            }}
                          >
                            <p className="font-medium text-foreground truncate text-[10px]">{appointmentStart.client_name}</p>
                            <p className="text-muted-foreground truncate text-[9px]">{appointmentStart.service_names?.[0]}</p>
                          </div>
                        )}
                      </div>
                    </ActionPopover>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[100px] p-2 border-r border-b border-border bg-muted/10" />
            ))}

            {/* Month days */}
            {monthDays.map((day) => {
              const dayAppointments = getAppointmentsForDate(day);
              
              return (
                <ActionPopover key={day.toISOString()} date={day} time="09:00">
                  <div
                    className={cn(
                      "min-h-[100px] p-2 border-r border-b border-border cursor-pointer hover:bg-muted/30 transition-colors",
                      isSameDay(day, new Date()) && "bg-primary/10",
                      !isSameDay(day, selectedDate) && "hover:bg-muted/50"
                    )}
                  >
                    <p className={cn(
                      "text-sm font-medium mb-1",
                      isSameDay(day, new Date()) ? "text-primary" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </p>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            "text-[10px] px-1 py-0.5 rounded truncate border-l-2",
                            getStatusClass(apt.status)
                          )}
                        >
                          {apt.start_time} {apt.client_name}
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{dayAppointments.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </ActionPopover>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment List */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-6">All Appointments</h2>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
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
                    <td className="p-4 font-medium text-foreground">{apt.client_name}</td>
                    <td className="p-4 text-muted-foreground">{apt.service_names?.join(', ')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {apt.staff_avatar_url && (
                          <img 
                            src={apt.staff_avatar_url} 
                            alt={apt.staff_name} 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-muted-foreground">{apt.staff_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{format(parseISO(apt.appointment_date), 'MMM d, yyyy')}</td>
                    <td className="p-4 text-muted-foreground">{apt.start_time}</td>
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
                    <td className="p-4 text-right font-medium text-foreground">₱{apt.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
