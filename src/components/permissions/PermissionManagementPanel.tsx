import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Shield, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PermissionStatusBadge } from './PermissionStatusBadge';
import { PermissionRequestModal } from './PermissionRequestModal';
import { getPatientPermissions, revokePatientPermission, canManagePatientPermissions, getClinicTherapists } from '../../lib/permissionAccess';
import { useToastStore } from '../../lib/store/toast';
import type { Permission, TherapistProfile } from '../../types/permissions';

interface PermissionManagementPanelProps {
  patientId: string;
  patientName: string;
  isPrimaryTherapist: boolean;
  isAdmin: boolean;
  onPermissionsChanged?: () => void;
}

export function PermissionManagementPanel({
  patientId,
  patientName,
  isPrimaryTherapist,
  isAdmin,
  onPermissionsChanged
}: PermissionManagementPanelProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [permissionsData, canManageData, therapistsData] = await Promise.all([
        getPatientPermissions(patientId),
        canManagePatientPermissions(patientId),
        getClinicTherapists(false) // Include current user
      ]);
      
      setPermissions(permissionsData);
      setCanManage(canManageData);
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Failed to load permission data:', error);
      addToast('error', 'Failed to load permission information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokePermission = async (userId: string) => {
    const therapist = therapists.find(t => t.id === userId);
    if (!therapist) return;

    if (!confirm(`Are you sure you want to revoke access for ${therapist.full_name}?`)) {
      return;
    }

    setRevoking(userId);
    try {
      await revokePatientPermission(patientId, userId);
      addToast('success', `Access revoked for ${therapist.full_name}`);
      await loadData();
      onPermissionsChanged?.();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      addToast('error', 'Failed to revoke access');
    } finally {
      setRevoking(null);
    }
  };

  const handlePermissionGranted = async () => {
    await loadData();
    onPermissionsChanged?.();
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Loading permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Patient Access Management</h3>
                <p className="text-sm text-gray-600">Manage who can access this patient's data</p>
              </div>
            </div>
            {canManage && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Grant Access
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          {permissions.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No additional access granted</p>
              <p className="text-sm text-gray-400">
                Only the primary therapist and clinic admins can access this patient
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(permissions || []).map((permission) => {
                const therapist = therapists.find(t => t.id === permission.user_id);
                const grantedBy = therapists.find(t => t.id === permission.granted_by);
                
                return (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {therapist?.full_name || 'Unknown User'}
                          </span>
                          <PermissionStatusBadge 
                            permission={permission.permission_level === 'full' ? 'owner' : 
                                      permission.permission_level === 'edit' ? 'edit' : 'view'}
                            size="sm"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Granted by {grantedBy?.full_name || 'Unknown'} on{' '}
                          {new Date(permission.granted_at).toLocaleDateString()}
                          {permission.expires_at && (
                            <>
                              {' • Expires '}
                              <span className="text-orange-600 font-medium">
                                {new Date(permission.expires_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {canManage && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRevokePermission(permission.user_id)}
                        disabled={revoking === permission.user_id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {revoking === permission.user_id ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            <span className="text-xs">Revoking...</span>
                          </div>
                        ) : (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span className="text-xs">Revoke</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!canManage && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 font-medium">Limited Access</p>
                  <p className="text-amber-700">
                    Only primary therapists and clinic admins can manage patient permissions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PermissionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        patientId={patientId}
        patientName={patientName}
        onPermissionGranted={handlePermissionGranted}
      />
    </>
  );
}