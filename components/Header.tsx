

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { User, UserStats } from '../types';
import UserStatsDisplay from './UserStatsDisplay';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { LoginIcon } from './icons/LoginIcon';

interface HeaderProps {
    onHomeClick: () => void;
    onLogout: () => void;
    user: User | null;
    stats: UserStats | null;
    onShowHistory: () => void;
    onShowReviewProgress: () => void;
    onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onLogout, user, stats, onShowHistory, onShowReviewProgress, onLoginClick }) => {
  const { appMode, setAppMode } = useContext(AppContext);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleToggle = () => {
    setAppMode(appMode === 'learning' ? 'clinical' : 'learning');
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setProfileMenuOpen(false);
  };

  return (
    <header className="bg-stone-200 dark:bg-stone-800 p-4 shadow-lg flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onHomeClick}>
        <MagnifyingGlassIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
        <h1 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-white">
          VINDICATE<span className="text-orange-500 dark:text-orange-400">.</span>
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {user && stats && (
            <div className="hidden lg:block">
                <UserStatsDisplay stats={stats} />
            </div>
        )}
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${appMode === 'clinical' ? 'text-orange-600 dark:text-orange-400' : 'text-stone-500 dark:text-stone-400'}`}>Clinical</span>
          <label htmlFor="mode-toggle" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="mode-toggle"
              className="sr-only peer"
              checked={appMode === 'learning'}
              onChange={handleToggle}
            />
            <div className="w-11 h-6 bg-stone-400 dark:bg-stone-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
          <span className={`text-sm font-medium ${appMode === 'learning' ? 'text-orange-600 dark:text-orange-400' : 'text-stone-500 dark:text-stone-400'}`}>Learning</span>
        </div>
        {user ? (
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setProfileMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                    {user.pictureUrl && (
                        <img src={user.pictureUrl} alt={user.name} className="w-7 h-7 rounded-full" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                     <svg className={`w-4 h-4 text-stone-600 dark:text-stone-300 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-stone-100 dark:bg-stone-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 animate-fade-in">
                        <div className="py-1">
                            <button onClick={() => handleMenuItemClick(onShowReviewProgress)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600">
                                <ChecklistIcon className="w-5 h-5" />
                                My Review Progress
                            </button>
                            <button onClick={() => handleMenuItemClick(onShowHistory)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600">
                                <BookmarkIcon className="w-5 h-5" />
                                Saved Scenarios
                            </button>
                            <div className="border-t border-stone-200 dark:border-stone-600 my-1"></div>
                            <button onClick={() => handleMenuItemClick(onLogout)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600">
                                <LogoutIcon className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-stone-400 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-900 focus:ring-orange-500 transition-colors font-semibold"
                aria-label="Login"
            >
                <LoginIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Login</span>
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;