import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

// Helper function to update user profile
export async function updateUserProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
}

// Helper function to complete onboarding
export async function completeOnboarding(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
  
  return data;
}

// Helper function to get upcoming blood drives
export async function getUpcomingBloodDrives(limit = 5) {
  const { data, error } = await supabase
    .from('blood_drives')
    .select('*')
    .gte('drive_date', new Date().toISOString())
    .order('drive_date', { ascending: true })
    .limit(limit);
    
  if (error) {
    console.error('Error fetching upcoming blood drives:', error);
    return [];
  }
  
  return data || [];
}

// Helper function to get user's donation history
export async function getUserDonations(userId: string) {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('donations')
    .select(`
      *,
      blood_drive:blood_drive_id (name, location)
    `)
    .eq('donor_id', userId)
    .order('donation_date', { ascending: false });
    
  if (error) {
    console.error('Error fetching user donations:', error);
    return [];
  }
  
  return data || [];
}

// Helper function to get user's upcoming appointments
export async function getUserAppointments(userId: string) {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('donation_appointments')
    .select(`
      *,
      blood_drive:blood_drive_id (name, location, drive_date)
    `)
    .eq('donor_id', userId)
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true });
    
  if (error) {
    console.error('Error fetching user appointments:', error);
    return [];
  }
  
  return data || [];
}

// Helper function to schedule an appointment
export async function scheduleAppointment(userId: string, bloodDriveId: string, appointmentDate: string) {
  const { data, error } = await supabase
    .from('donation_appointments')
    .insert({
      donor_id: userId,
      blood_drive_id: bloodDriveId,
      appointment_date: appointmentDate,
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error scheduling appointment:', error);
    throw error;
  }
  
  return data;
}

// Helper function to get user's notifications
export async function getUserNotifications(userId: string) {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
  
  return data || [];
}

// Helper function to mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
  
  return true;
} 