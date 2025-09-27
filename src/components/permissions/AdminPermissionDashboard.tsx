import React, { useState, useEffect } from 'react';
import { Shield, Activity, TrendingUp, Users, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PermissionStatusBadge } from './PermissionStatusBadge';
import { getRecentPermissionActivities, getPatientsWithPermissions, getClinicTherapists } from '../../lib/permissionAccess';
import { useToastStore } from '../../lib/store/toast';
import { useAuthStore } from '../../lib/store/auth';
import type { PermissionActivity, PatientWithPermissions, TherapistProfile } from '../../types/permissions';

export function AdminPermissionDashboard() {
  const [activities, setActivities] = useState<PermissionActivity[]>([]);
  const [patients, setPatients] = useState<PatientWithPermissions[]>([]);
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    patientsWithPermissions: 0,
    activePermissions: 0,
    recentActivities: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    // Only load dashboard data when user is fully authenticated in multi-user mode
    if (user && user.isMultiUser) {
      // Add a small delay to ensure authentication session is stable
      const timer = setTimeout(() => {
        loadDashboardData();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (user && !user.isMultiUser) {
      // Single user mode - don't try to load permissions dashboard
      setIsLoading(false);
    }
  }, [user?.isMultiUser, user?.profile_id]); // Only depend on specific user properties

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [activitiesData, patientsData, therapistsData] = await Promise.all([
        getRecentPermissionActivities(100),
        getPatientsWithPermissions(),
        getClinicTherapists(false)
      ]);
      
      // Ensure all data is arrays
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setTherapists(Array.isArray(therapistsData) ? therapistsData : []);
      
      // Calculate stats
      const safePatients = Array.isArray(patientsData) ? patientsData : [];
      const patientsWithPerms = safePatients.filter(p => p?.permissions && Array.isArray(p.permissions) && p.permissions.length > 0);
      const totalActivePermissions = safePatients.reduce((sum, p) => sum + (Array.isArray(p?.permissions) ? p.permissions.length : 0), 0);
      
      setStats({
        totalPatients: safePatients.length,
        patientsWithPermissions: patientsWithPerms.length,
        activePermissions: totalActivePermissions,
        recentActivities: Array.isArray(activitiesData) ? activitiesData.length : 0
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      addToast('error', 'Failed to load permission dashboard. Please try refreshing the page.');
      // Set default empty states on error
      setActivities([]);
      setPatients([]);
      setTherapists([]);
      setStats({
        totalPatients: 0,
        patientsWithPermissions: 0,
        activePermissions: 0,
        recentActivities: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'requested':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading permission dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management Dashboard</h1>
          <p className="text-gray-600">Monitor and manage patient access permissions across your clinic</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Shared Access</p>
              <p className="text-2xl font-bold text-gray-900">{stats.patientsWithPermissions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePermissions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Activities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivities}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients with Shared Access */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Patients with Shared Access</h3>
            <p className="text-sm text-gray-600">Patients that have permissions granted to other therapists</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(() => {
              const safePatients = Array.isArray(patients) ? patients : [];
              const patientsWithPermissions = safePatients.filter(p => p?.permissions && Array.isArray(p.permissions) && p.permissions.length > 0);
              
              if (patientsWithPermissions.length === 0) {
                return (
                  <div className="p-6 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No shared access permissions</p>
                    <p className="text-sm text-gray-400">All patients are only accessible by their primary therapists</p>
                  </div>
                );
              }
              
              return (
                <div className="divide-y divide-gray-200">
                  {patientsWithPermissions
                    .slice(0, 10)
                    .map((patient) => {
                      if (!patient || !patient.id) return null;
                      return (
                    <div key={patient.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {Array.isArray(patient.permissions) ? patient.permissions.length : 0} permission{(Array.isArray(patient.permissions) ? patient.permissions.length : 0) !== 1 ? 's' : ''} granted
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(patient?.permissions) ? patient.permissions : []).slice(0, 3).map((permission, index) => {
                            const therapist = (Array.isArray(therapists) ? therapists : []).find(t => t?.id === permission?.user_id);
                            return (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                                title={`${therapist?.full_name || 'Unknown'}: ${permission?.permission_level || 'unknown'}`}
                              >
                                {therapist?.full_name || 'Unknown'}
                              </span>
                            );
                          })}
                          {(Array.isArray(patient?.permissions) ? patient.permissions.length : 0) > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              +{(Array.isArray(patient?.permissions) ? patient.permissions.length : 0) - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Permission Activities</h3>
            <p className="text-sm text-gray-600">Latest permission grants, revocations, and requests</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(() => {
              const safeActivities = Array.isArray(activities) ? activities : [];
              if (safeActivities.length === 0) {
                return (
                  <div className="p-6 text-center">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activities</p>
                    <p className="text-sm text-gray-400">Permission activities will appear here</p>
                  </div>
                );
              }
              
              return (
                <div className="divide-y divide-gray-200">
                  {safeActivities.slice(0, 10).map((activity, index) => {
                    if (!activity) return null;
                    return (
                  <div key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user_name}</span>
                          {' '}
                          {activity.type === 'granted' && 'was granted'}
                          {activity.type === 'revoked' && 'had access revoked for'}
                          {activity.type === 'requested' && 'requested access to'}
                          {activity.type === 'expired' && 'access expired for'}
                          {' '}
                          <span className="font-medium">{activity.patient_name}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                          {activity.permission_level !== 'revoked' && (
                            <PermissionStatusBadge
                              permission={activity.permission_level === 'full' ? 'owner' : 
                                        activity.permission_level === 'edit' ? 'edit' : 'view'}
                              size="sm"
                              showText={false}
                            />
                          )}
                          {activity.granted_by_name && (
                            <span className="text-xs text-gray-500">
                              by {activity.granted_by_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Admin Actions</h3>
          <p className="text-sm text-gray-600">Administrative tools for permission management</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Override Permissions</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Grant or revoke access to any patient regardless of primary therapist.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Manage Overrides
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Bulk Actions</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Perform bulk permission operations across multiple patients.
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Bulk Operations
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-gray-900">Audit Trail</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                View detailed audit logs of all permission activities.
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}