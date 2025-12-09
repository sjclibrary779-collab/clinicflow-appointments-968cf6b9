import { Calendar, Users, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { mockAppointments, mockClients, mockServices } from '@/data/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DashboardHome = () => {
  const today = new Date();
  const todayAppointments = mockAppointments.filter(
    apt => apt.date.toDateString() === today.toDateString()
  );

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length.toString(),
      icon: Calendar,
      change: '+2 from yesterday',
      color: 'text-primary'
    },
    {
      label: 'Total Clients',
      value: mockClients.length.toString(),
      icon: Users,
      change: '+5 this month',
      color: 'text-[hsl(var(--status-confirmed))]'
    },
    {
      label: 'Services Offered',
      value: mockServices.length.toString(),
      icon: Clock,
      change: '8 active',
      color: 'text-[hsl(var(--status-completed))]'
    },
    {
      label: "Today's Revenue",
      value: `$${todayAppointments.reduce((sum, apt) => sum + apt.price, 0)}`,
      icon: DollarSign,
      change: '+12% vs avg',
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
              {todayAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-semibold text-foreground">{apt.startTime}</p>
                    <p className="text-xs text-muted-foreground">{apt.endTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{apt.clientName}</p>
                    <p className="text-sm text-muted-foreground truncate">{apt.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusClass(apt.status)
                    )}>
                      {apt.status}
                    </span>
                    <p className="text-sm font-medium text-foreground mt-1">${apt.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Recent Clients</h2>
          
          <div className="space-y-4">
            {mockClients.slice(0, 5).map((client) => (
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
                    Joined {format(client.createdAt, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
