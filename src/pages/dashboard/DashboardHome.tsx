import { Calendar, Users, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';

const DashboardHome = () => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { clients, loading: clientsLoading } = useClients();
  const { services, loading: servicesLoading } = useServices();

  const todayAppointments = appointments?.filter(
    apt => apt.appointment_date === todayStr
  ) || [];

  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + Number(apt.total_price || 0), 0);
  const activeServices = services?.filter(s => s.is_active).length || 0;

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      change: `${todayAppointments.filter(a => a.status === 'confirmed').length} confirmed`,
      color: 'text-primary'
    },
    {
      label: 'Total Clients',
      value: (clients?.length || 0).toString(),
      icon: Users,
      change: 'All time',
      color: 'text-[hsl(var(--status-confirmed))]'
    },
    {
      label: 'Services Offered',
      value: (services?.length || 0).toString(),
      icon: Clock,
      change: `${activeServices} active`,
      color: 'text-[hsl(var(--status-completed))]'
    },
    {
      label: "Today's Revenue",
      value: `₱${todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `${todayAppointments.length} bookings`,
      color: 'text-[hsl(var(--status-pending))]'
    }
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const isLoading = appointmentsLoading || clientsLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-muted mb-4" />
              <div className="h-8 w-20 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl bg-accent flex items-center justify-center", stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-serif font-semibold text-foreground mb-1">{stat.value}</p>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">Today's Schedule</h2>
            <span className="text-sm text-muted-foreground">{format(today, 'EEEE, MMMM d')}</span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.slice(0, 5).map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-semibold text-foreground">{apt.start_time?.slice(0, 5)}</p>
                    <p className="text-xs text-muted-foreground">{apt.end_time?.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.client_name || 'Client'}</p>
                    <p className="text-sm text-muted-foreground truncate">{apt.staff_name || 'Staff'}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusClass(apt.status)
                    )}>
                      {apt.status}
                    </span>
                    <p className="text-sm font-medium text-foreground mt-1">₱{Number(apt.total_price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Recent Clients</h2>
          
          {(!clients || clients.length === 0) ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => (
                <div 
                  key={client.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <span className="font-semibold text-accent-foreground">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{client.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(client.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;