import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Client {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  notes: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error('Failed to load clients');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (formData: ClientFormData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          ...formData,
          date_of_birth: formData.date_of_birth || null,
        }])
        .select()
        .single();

      if (error) throw error;
      setClients(prev => [...prev, data]);
      toast.success('Client created successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client');
      return { success: false, error };
    }
  };

  const updateClient = async (id: string, formData: ClientFormData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...formData,
          date_of_birth: formData.date_of_birth || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Client updated successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to update client');
      return { success: false, error };
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Client deleted successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete client');
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
};
