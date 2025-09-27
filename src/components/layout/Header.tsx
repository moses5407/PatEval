import React from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { LogOut, User } from 'lucide-react';
import { BusinessSelector } from './BusinessSelector';

export function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Patient Evaluation System
          </h1>

          <div className="flex items-center space-x-4">
            <BusinessSelector />
            
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{user?.fullName}</span>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}