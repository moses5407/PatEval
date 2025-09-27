import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../lib/store/auth';
import { isMultiUserMode } from '../../lib/supabase';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isMultiUser, setIsMultiUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  useEffect(() => {
    const checkMode = async () => {
      const multiUser = await isMultiUserMode();
      setIsMultiUser(multiUser);
    };
    checkMode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isMultiUser) {
        await signIn(email, password);
      } else {
        await signIn(); // Single-user mode
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while determining mode
  if (isMultiUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isMultiUser ? 'Sign in to your clinic account' : 'Patient Evaluation System'}
          </h2>
          {isMultiUser && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your clinic credentials to continue
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {isMultiUser ? (
            // Multi-user mode: Show email/password form
            <>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          ) : (
            // Single-user mode: Show simple entry message
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Click to enter the application
              </p>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : (isMultiUser ? 'Sign in' : 'Enter Application')}
            </button>
          </div>
        </form>
        
        {!isMultiUser && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Running in single-user mode
            </p>
          </div>
        )}
      </div>
    </div>
  );
}