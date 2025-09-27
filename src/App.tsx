import React, { useEffect, useState } from 'react';
import { useAuthStore } from './lib/store/auth';
import { PatientForm } from './components/PatientForm';
import { SignIn } from './components/auth/SignIn';
import { PermissionManagementPage } from './components/permissions/PermissionManagementPage';
import { initializeTestData } from './lib/testData';
import { initializeDataAccess, isDatabaseEmpty, addTestPatient } from './lib/dataAccess';
import { ToastContainer } from './components/ToastContainer';
import { Users, FileText, Shield, Settings } from 'lucide-react';

type AppView = 'evaluations' | 'permissions' | 'settings';

function App() {
  const { user, loading, initializeAuth } = useAuthStore();
  const [currentView, setCurrentView] = useState<AppView>('evaluations');

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize data access layer (determines single-user vs multi-user)
        const { isMultiUser } = await initializeDataAccess();
        
        // Initialize authentication
        await initializeAuth();
        
        // Add test data only in single-user mode
        if (!isMultiUser) {
          const isEmpty = await isDatabaseEmpty();
          if (isEmpty) {
            await initializeTestData();
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initApp();
  }, [initializeAuth]);

  const navigationItems = [
    {
      id: 'evaluations' as AppView,
      label: 'Patient Evaluations',
      icon: FileText,
      description: 'Create and manage patient evaluations'
    },
    ...(user?.isMultiUser ? [{
      id: 'permissions' as AppView,
      label: 'Access Management',
      icon: Shield,
      description: 'Manage patient access permissions'
    }] : []),
    {
      id: 'settings' as AppView,
      label: 'Settings',
      icon: Settings,
      description: 'Application settings'
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'evaluations':
        return <PatientForm />;
      case 'permissions':
        return <PermissionManagementPage />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Settings</h2>
            <p className="text-gray-600">Settings panel will be available in a future update.</p>
          </div>
        );
      default:
        return <PatientForm />;
    }
  };

  // Show loading spinner during initialization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in if no user
  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Patient Evaluation System
              </h1>
              {user.isMultiUser && (
                <p className="text-sm text-gray-600">
                  {user.clinicName} • {user.role}
                  {user.isAdmin && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                {user.isMultiUser && user.clinicName && (
                  <p className="text-sm text-gray-500">{user.clinicName}</p>
                )}
                <span className="text-sm text-gray-600">{user.name}</span>
              </div>
              {user.isMultiUser && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Multi-User
                </span>
              )}
              <button
                onClick={() => useAuthStore.getState().signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Only show for multi-user systems */}
      {user.isMultiUser && (
        <nav className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                      ${
                        currentView === item.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      <ToastContainer />
    </div>
  );
}

export default App;