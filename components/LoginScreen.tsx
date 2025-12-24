import React, { useState } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    const mockUser: User = {
      name: 'Demo User',
      email: 'demo.user@example.com',
      pictureUrl: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3ccircle cx='12' cy='12' r='12' fill='%2364748b'/%3e%3cg fill='white'%3e%3ccircle cx='12' cy='9' r='3.5' /%3e%3cpath d='M12,14c-3.86,0-7,2.5-7,6v1h14v-1c0-3.5-3.14-6-7-6Z' /%3e%3c/g%3e%3c/svg%3e`
    };
    onLogin(mockUser);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    // For this demo, any input is accepted.
    setError('');
    // Create a mock user object for email login
    const user: User = {
        name: email.split('@')[0], // Simple name from email
        email: email,
    };
    onLogin(user);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
         <button onClick={onClose} className="absolute top-3 right-3 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white text-3xl leading-none" aria-label="Close">&times;</button>
        <div className="text-center mb-6">
            <MagnifyingGlassIcon className="w-16 h-16 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">
                VINDICATE<span className="text-orange-500 dark:text-orange-400">.</span>
            </h1>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
                Sign in to access the Differential Diagnosis Trainer.
            </p>
        </div>
        
        <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-stone-800 mb-4"
        >
            <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 398.8 0 256S110.3 0 244 0c73 0 135.3 29.1 181.5 75.3l-72.3 69.3c-23.8-22.5-54.9-36.3-90.2-36.3-69.3 0-126.3 57.3-126.3 128s57 128 126.3 128c76.3 0 105.3-54.3 109.8-82.8H244v-91.2h244z"></path>
            </svg>
            Sign in with Google
        </button>
        
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-stone-300 dark:border-stone-600"></div>
            <span className="flex-shrink mx-4 text-stone-500 dark:text-stone-400 text-sm">OR</span>
            <div className="flex-grow border-t border-stone-300 dark:border-stone-600"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-stone-800"
              >
                Sign In with Email
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default LoginScreen;