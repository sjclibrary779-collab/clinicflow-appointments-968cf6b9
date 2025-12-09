import { useState } from 'react';
import { Search, Plus, Mail, Phone, Clock, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockStaff, mockServices } from '@/data/mockData';
import { cn } from '@/lib/utils';

const StaffPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = mockStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getServicesForStaff = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    if (!staff) return [];
    return mockServices.filter(service => staff.serviceIds.includes(service.id));
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">{mockStaff.length}</p>
          <p className="text-muted-foreground text-sm">Total Staff</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">
            {mockStaff.filter(s => s.isActive).length}
          </p>
          <p className="text-muted-foreground text-sm">Active Members</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">
            {Math.round(mockStaff.reduce((sum, s) => sum + s.serviceIds.length, 0) / mockStaff.length)}
          </p>
          <p className="text-muted-foreground text-sm">Avg. Services Per Staff</p>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div 
            key={staff.id}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <span className="text-xl font-semibold text-accent-foreground">
                  {staff.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{staff.name}</h3>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    staff.isActive 
                      ? "bg-[hsl(var(--status-confirmed)/0.15)] text-[hsl(var(--status-confirmed))]"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-primary font-medium">{staff.title}</p>
              </div>
            </div>

            {/* Bio */}
            {staff.bio && (
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{staff.bio}</p>
            )}

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{staff.email}</span>
              </p>
              <p className="text-sm flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {staff.phone}
              </p>
            </div>

            {/* Working Hours */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Hours
              </h4>
              <div className="flex flex-wrap gap-1">
                {staff.workingHours.map((wh, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      wh.isWorking 
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {getDayName(wh.dayOfWeek)}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Services ({getServicesForStaff(staff.id).length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {getServicesForStaff(staff.id).map(service => (
                  <span 
                    key={service.id}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No staff members found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
