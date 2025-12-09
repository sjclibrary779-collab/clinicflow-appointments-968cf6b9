import { useState } from 'react';
import { Search, Plus, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockClients } from '@/data/mockData';
import { format } from 'date-fns';

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <Button variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">{mockClients.length}</p>
          <p className="text-muted-foreground text-sm">Total Clients</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">3</p>
          <p className="text-muted-foreground text-sm">New This Month</p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-3xl font-serif font-semibold text-foreground">12</p>
          <p className="text-muted-foreground text-sm">Active Treatments</p>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div 
            key={client.id}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
                <span className="text-lg font-semibold text-accent-foreground">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{client.email}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Joined {format(client.createdAt, 'MMM d, yyyy')}
              </p>
            </div>

            {client.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground line-clamp-2">{client.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No clients found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
