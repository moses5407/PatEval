import { supabase, getCurrentUserProfile } from './supabase';
import type { Permission, PermissionRequest, PatientWithPermissions, TherapistProfile, PermissionActivity } from '../types/permissions';

// Get therapists in the same clinic
export async function getClinicTherapists(excludeCurrentUser = true): Promise<TherapistProfile[]> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) {
      console.warn('No user profile available for clinic therapists query');
      return [];
    }

    let query = supabase
      .from('user_profiles')
      .select('id, full_name, email, role, clinic_id, is_admin')
      .eq('clinic_id', currentProfile.clinic_id);

    if (excludeCurrentUser) {
      query = query.neq('id', currentProfile.profile_id);
    }

    const { data, error } = await query.order('full_name');
    if (error) {
      console.error('Error fetching clinic therapists:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get clinic therapists:', error);
    throw error;
  }
}

// Get patient permissions
export async function getPatientPermissions(patientId: string): Promise<Permission[]> {
  try {
    const { data, error } = await supabase
      .from('patient_permissions')
      .select(`
        *,
        user_profiles!patient_permissions_user_id_fkey(full_name),
        granted_by_profile:user_profiles!patient_permissions_granted_by_fkey(full_name)
      `)
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get patient permissions:', error);
    throw error;
  }
}

// Grant permission to a user
export async function grantPatientPermission(
  patientId: string,
  userId: string,
  permissionLevel: 'view' | 'edit' | 'full',
  expiresAt?: string
): Promise<Permission> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) throw new Error('No user profile found');

    const { data, error } = await supabase
      .from('patient_permissions')
      .upsert({
        patient_id: patientId,
        user_id: userId,
        permission_level: permissionLevel,
        granted_by: currentProfile.profile_id,
        expires_at: expiresAt || null,
        is_active: true
      }, {
        onConflict: 'patient_id,user_id'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Log the permission activity
    await logPermissionActivity({
      type: 'granted',
      patient_id: patientId,
      user_id: userId,
      granted_by: currentProfile.profile_id,
      permission_level: permissionLevel
    });

    return data;
  } catch (error) {
    console.error('Failed to grant permission:', error);
    throw error;
  }
}

// Revoke permission
export async function revokePatientPermission(patientId: string, userId: string): Promise<void> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) throw new Error('No user profile found');

    const { error } = await supabase
      .from('patient_permissions')
      .update({ is_active: false })
      .eq('patient_id', patientId)
      .eq('user_id', userId);

    if (error) throw error;

    // Log the permission activity
    await logPermissionActivity({
      type: 'revoked',
      patient_id: patientId,
      user_id: userId,
      granted_by: currentProfile.profile_id,
      permission_level: 'revoked'
    });
  } catch (error) {
    console.error('Failed to revoke permission:', error);
    throw error;
  }
}

// Get patients with permission status for current user
export async function getPatientsWithPermissions(): Promise<PatientWithPermissions[]> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) {
      console.warn('No user profile available for permissions check');
      return [];
    }

    // Get all patients in the clinic
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', currentProfile.clinic_id)
      .order('last_name', { ascending: true });

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      throw patientsError;
    }

    if (!patients) return [];

    // Get permissions for all patients
    const patientIds = patients.map(p => p.id);
    const { data: permissions, error: permissionsError } = await supabase
      .from('patient_permissions')
      .select('*')
      .in('patient_id', patientIds)
      .eq('is_active', true);

    if (permissionsError) {
      console.error('Error fetching permissions:', permissionsError);
      throw permissionsError;
    }

    // Combine patients with permission status
    return patients.map(patient => {
      const patientPermissions = permissions?.filter(p => p.patient_id === patient.id) || [];
      const userPermission = patientPermissions.find(p => p.user_id === currentProfile.profile_id);
      const isPrimaryTherapist = patient.primary_therapist_id === currentProfile.profile_id;
      
      let permissionLevel: 'owner' | 'edit' | 'view' | 'none' = 'none';
      
      if (isPrimaryTherapist || currentProfile.is_admin) {
        permissionLevel = 'owner';
      } else if (userPermission) {
        switch (userPermission.permission_level) {
          case 'full':
          case 'edit':
            permissionLevel = 'edit';
            break;
          case 'view':
            permissionLevel = 'view';
            break;
        }
      }

      return {
        ...patient,
        permissions: patientPermissions,
        user_permission: permissionLevel,
        is_primary_therapist: isPrimaryTherapist
      };
    });
  } catch (error) {
    console.error('Failed to get patients with permissions:', error);
    throw error;
  }
}

// Log permission activity for admin notifications
export async function logPermissionActivity(activity: {
  type: 'granted' | 'revoked' | 'requested' | 'expired';
  patient_id: string;
  user_id: string;
  granted_by?: string;
  permission_level: string;
  reason?: string;
}): Promise<void> {
  try {
    // This would typically be stored in a permission_activities table
    // For now, we'll just log it to console in a structured way
    console.log('Permission Activity:', {
      ...activity,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement actual database logging when permission_activities table is created
    // const { error } = await supabase
    //   .from('permission_activities')
    //   .insert({
    //     ...activity,
    //     timestamp: new Date().toISOString()
    //   });
    // 
    // if (error) throw error;
  } catch (error) {
    console.error('Failed to log permission activity:', error);
  }
}

// Check if current user can manage permissions for a patient
export async function canManagePatientPermissions(patientId: string): Promise<boolean> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) return false;

    // Admins can manage all permissions
    if (currentProfile.is_admin) return true;

    // Check if user is primary therapist
    const { data: patient, error } = await supabase
      .from('patients')
      .select('primary_therapist_id')
      .eq('id', patientId)
      .single();

    if (error) throw error;

    return patient.primary_therapist_id === currentProfile.profile_id;
  } catch (error) {
    console.error('Failed to check permission management rights:', error);
    return false;
  }
}

// Get recent permission activities (for admin dashboard)
export async function getRecentPermissionActivities(limit = 50): Promise<PermissionActivity[]> {
  try {
    // This would fetch from permission_activities table when implemented
    // For now, return empty array
    return [];
    
    // TODO: Implement when permission_activities table is created
    // const { data, error } = await supabase
    //   .from('permission_activities')
    //   .select(`
    //     *,
    //     patients(first_name, last_name),
    //     user_profiles!permission_activities_user_id_fkey(full_name),
    //     granted_by_profile:user_profiles!permission_activities_granted_by_fkey(full_name)
    //   `)
    //   .order('timestamp', { ascending: false })
    //   .limit(limit);
    // 
    // if (error) throw error;
    // return data || [];
  } catch (error) {
    console.error('Failed to get permission activities:', error);
    return [];
  }
}