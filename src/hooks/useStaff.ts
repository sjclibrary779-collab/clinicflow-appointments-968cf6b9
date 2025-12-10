import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Staff {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  title: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  is_active: boolean;
}

export const useStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');

      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error('Failed to load staff');
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (formData: StaffFormData) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      setStaff(prev => [...prev, data]);
      toast.success('Staff member created successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to create staff member');
      return { success: false, error };
    }
  };

  const updateStaff = async (id: string, formData: StaffFormData) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Staff member updated successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff member');
      return { success: false, error };
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setStaff(prev => prev.filter(s => s.id !== id));
      toast.success('Staff member deleted successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff member');
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    createStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff,
  };
};
