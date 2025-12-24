
import React, { useContext } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { AppContext } from '../contexts/AppContext';

interface HomeScreenProps {
  onSelectMode: (view: 'presentation' | 'about') => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectMode }) => {
  const { appMode } = useContext(AppContext);

  if (appMode === 'clinical') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 text-center animate-fade-in">
            <MagnifyingGlassIcon className="w-24 h-24 text-orange-500 dark:text-orange-400 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-8">
                Clinical Mode
            </h1>

            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelectMode('presentation')}
                    className="flex flex-col justify-center items-center bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-orange-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">DDx</h2>
                </button>
                <button
                    onClick={() => onSelectMode('about')}
                    className="flex flex-col justify-center items-center bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-stone-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-stone-500"
                >
                    <h2 className="text-2xl font-bold text-stone-600 dark:text-stone-400">About</h2>
                </button>
            </div>
        </div>
    );
  }

  // Learning Mode
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-4 text-center animate-fade-in">
      <MagnifyingGlassIcon className="w-24 h-24 text-orange-500 dark:text-orange-400 mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold text-stone-800 dark:text-stone-100 mb-12">
        Learning Mode
      </h1>
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode('presentation')}
            className="flex flex-col justify-center items-center bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-orange-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Learn</h2>
          </button>
          <button
              onClick={() => onSelectMode('about')}
              className="flex flex-col justify-center items-center bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-stone-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
              <h2 className="text-2xl font-bold text-stone-600 dark:text-stone-400">About</h2>
          </button>
      </div>
    </div>
  );
};

export default HomeScreen;