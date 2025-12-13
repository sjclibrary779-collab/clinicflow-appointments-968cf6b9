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
  avatar_url?: string;
  password?: string;
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
    } catch (error: unknown) {
      toast.error('Failed to load staff');
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (formData: StaffFormData) => {
    try {
      // If password is provided, create user account via edge function
      if (formData.password && formData.password.length >= 6) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('You must be logged in to create staff');
        }

        const response = await supabase.functions.invoke('create-user-account', {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.name,
            phone: formData.phone,
            userType: 'staff',
            additionalData: {
              title: formData.title,
              bio: formData.bio,
              is_active: formData.is_active,
              avatar_url: formData.avatar_url,
            },
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to create user account');
        }

        if (response.data?.error) {
          throw new Error(response.data.error);
        }

        await fetchStaff();
        toast.success('Staff account created successfully');
        return { success: true };
      }

      // Create staff without user account
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          title: formData.title,
          bio: formData.bio || null,
          is_active: formData.is_active,
          avatar_url: formData.avatar_url || null,
        }])
        .select()
        .single();

      if (error) throw error;
      setStaff(prev => [...prev, data]);
      toast.success('Staff member created successfully');
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create staff member';
      toast.error(message);
      return { success: false, error };
    }
  };

  const updateStaff = async (id: string, formData: StaffFormData) => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          title: formData.title,
          bio: formData.bio || null,
          is_active: formData.is_active,
          avatar_url: formData.avatar_url || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setStaff(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Staff member updated successfully');
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update staff member';
      toast.error(message);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete staff member';
      toast.error(message);
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
