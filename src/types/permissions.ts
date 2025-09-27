export interface Permission {
  id: string;
  patientId: string;
  userId: string;
  permissionLevel: 'view' | 'edit' | 'full';
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface PermissionRequest {
  id?: string;
  patientId: string;
  requestedBy: string;
  requestedFor: string;
  permissionLevel: 'view' | 'edit' | 'full';
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface PatientWithPermissions {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  primaryTherapistId?: string;
  clinicId?: string;
  permissions?: Permission[];
  userPermission?: 'owner' | 'edit' | 'view' | 'none';
  isPrimaryTherapist?: boolean;
}

export interface TherapistProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  clinicId: string;
  isAdmin: boolean;
}

export interface PermissionActivity {
  id: string;
  type: 'granted' | 'revoked' | 'requested' | 'expired';
  patientId: string;
  patientName: string;
  userId: string;
  userName: string;
  grantedBy?: string;
  grantedByName?: string;
  permissionLevel: string;
  timestamp: string;
  reason?: string;
}