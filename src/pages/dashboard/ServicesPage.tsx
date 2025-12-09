import { useState } from 'react';
import { Search, Plus, Clock, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockServices, serviceCategories, mockStaff } from '@/data/mockData';
import { cn } from '@/lib/utils';

const ServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStaffForService = (serviceId: string) => {
    return mockStaff.filter(staff => staff.serviceIds.includes(serviceId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            !selectedCategory 
              ? "bg-primary text-primary-foreground" 
              : "bg-card border border-border text-muted-foreground hover:bg-muted"
          )}
        >
          All Services
        </button>
        {serviceCategories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === category 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">{mockServices.length}</p>
          <p className="text-muted-foreground text-sm">Total Services</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">{serviceCategories.length}</p>
          <p className="text-muted-foreground text-sm">Categories</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">
            ${Math.round(mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length)}
          </p>
          <p className="text-muted-foreground text-sm">Avg. Price</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">
            {Math.round(mockServices.reduce((sum, s) => sum + s.duration, 0) / mockServices.length)}
          </p>
          <p className="text-muted-foreground text-sm">Avg. Duration (min)</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div 
            key={service.id}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {service.category}
                </span>
                <h3 className="font-serif text-xl font-semibold text-foreground mt-3">{service.name}</h3>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                service.isActive 
                  ? "bg-[hsl(var(--status-confirmed)/0.15)] text-[hsl(var(--status-confirmed))]"
                  : "bg-muted text-muted-foreground"
              )}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {service.description}
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {service.duration} min
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <DollarSign className="h-4 w-4" />
                {service.price === 0 ? 'Free' : `$${service.price}`}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{getStaffForService(service.id).length} specialists available</span>
              </div>
              <div className="flex -space-x-2 mt-2">
                {getStaffForService(service.id).slice(0, 3).map(staff => (
                  <div 
                    key={staff.id}
                    className="w-8 h-8 rounded-full bg-accent border-2 border-card flex items-center justify-center"
                    title={staff.name}
                  >
                    <span className="text-xs font-medium text-accent-foreground">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No services found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
