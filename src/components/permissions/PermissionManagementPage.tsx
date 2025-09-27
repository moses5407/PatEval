import React, { useState } from 'react';
import { Shield, Users, Settings, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../lib/store/auth';
import { PatientListWithPermissions } from './PatientListWithPermissions';
import { AdminPermissionDashboard } from './AdminPermissionDashboard';

type ViewMode = 'patients' | 'dashboard' | 'settings';

export function PermissionManagementPage() {
  console.log('🔍 PermissionManagementPage component rendering...');
  const [activeView, setActiveView] = useState<ViewMode>('patients');
  const { user } = useAuthStore();
  
  console.log('🔍 PermissionManagementPage state:', { 
    activeView, 
    user: user ? 'exists' : 'null',
    userIsAdmin: user?.isAdmin,
    userIsMultiUser: user?.isMultiUser 
  });

  const navigationItems = [
    {
      id: 'patients' as ViewMode,
      label: 'Patient Access',
      icon: Users,
      description: 'Manage patient access permissions'
    },
    ...(user?.isAdmin ? [{
      id: 'dashboard' as ViewMode,
      label: 'Admin Dashboard',
      icon: BarChart3,
      description: 'Overview of all permission activities'
    }] : []),
    {
      id: 'settings' as ViewMode,
      label: 'Settings',
      icon: Settings,
      description: 'Permission system configuration'
    }
  ];

  const renderContent = () => {
    console.log('🔍 PermissionManagementPage renderContent called with activeView:', activeView);
    switch (activeView) {
      case 'patients':
        console.log('🔍 Rendering PatientListWithPermissions');
        return <PatientListWithPermissions />;
      case 'dashboard':
        console.log('🔍 Rendering AdminPermissionDashboard (user isAdmin:', user?.isAdmin, ')');
        return user?.isAdmin ? <AdminPermissionDashboard /> : <PatientListWithPermissions />;
      case 'settings':
        console.log('🔍 Rendering Settings placeholder');
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Permission Settings</h3>
            <p className="text-gray-600">Permission settings will be available in a future update.</p>
          </div>
        );
      default:
        console.log('🔍 Default case - rendering PatientListWithPermissions');
        return <PatientListWithPermissions />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
          <p className="text-gray-600">Manage patient access and collaboration permissions</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`
                  flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors
                  ${
                    activeView === item.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}