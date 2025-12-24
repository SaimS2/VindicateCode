

import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { ListIcon } from './icons/ListIcon';
import { ShuffleIcon } from './icons/ShuffleIcon';
import { Difficulty, Presentation, User } from '../types';
import { SettingsIcon } from './icons/SettingsIcon';
import { CheckmarkIcon } from './icons/CheckmarkIcon';
import { AppContext } from '../contexts/AppContext';

interface PresentationSelectionMethodProps {
  user: User | null;
  onBack: () => void;
  onSearchSubmit: (term: string) => void;
  onSelectIndex: () => void;
  onSelectRandom: (difficulty?: Difficulty) => void;
  presentationsBySystem: { [key: string]: Presentation[] };
  onSelectPresentation: (presentation: Presentation) => void;
  onSelectReview: () => void;
}

const SelectionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}> = ({ onClick, icon, title }) => (
  <button
    onClick={onClick}
    className="w-full bg-stone-100 dark:bg-stone-800 p-6 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-orange-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 text-left flex items-center gap-6"
  >
    <div className="flex-shrink-0 text-orange-500 dark:text-orange-400">
        {icon}
    </div>
    <div>
        <h3 className="text-lg font-semibold text-stone-800 dark:text-white">{title}</h3>
    </div>
  </button>
);

const PresentationSelectionMethod: React.FC<PresentationSelectionMethodProps> = ({
  user,
  onBack,
  onSearchSubmit,
  onSelectIndex,
  onSelectRandom,
  presentationsBySystem,
  onSelectPresentation,
  onSelectReview,
}) => {
  const { appMode } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Presentation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isRandomMenuOpen, setRandomMenuOpen] = useState(false);
  const randomMenuRef = useRef<HTMLDivElement>(null);

  const allPresentations = useMemo(() => {
    const flatList = Object.values(presentationsBySystem).flat();
    // FIX: Explicitly type `p`, `a`, and `b` as `Presentation` to resolve type inference issues where they were being inferred as `unknown`.
    return Array.from(new Map(flatList.map((p: Presentation) => [p.name, p])).values())
      .sort((a: Presentation, b: Presentation) => a.name.localeCompare(b.name));
  }, [presentationsBySystem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node) &&
            (!randomMenuRef.current || !randomMenuRef.current.contains(event.target as Node))
        ) {
            setShowSuggestions(false);
        }
        if (randomMenuRef.current && !randomMenuRef.current.contains(event.target as Node)) {
            setRandomMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      const filteredSuggestions = allPresentations
        .filter(p => p.name.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 7); // Limit suggestions for better UI
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (presentation: Presentation) => {
    setSearchTerm(presentation.name);
    setShowSuggestions(false);
    onSelectPresentation(presentation);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      onSearchSubmit(searchTerm.trim());
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-start mb-6 w-full">
          <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Patient Population</button>
        </div>
        <h2 className="text-2xl font-bold text-center mb-8 text-stone-700 dark:text-stone-300">Select Presentation</h2>
        <div className="space-y-4 w-full">
            <div ref={searchContainerRef} className="relative w-full">
                <form onSubmit={handleFormSubmit} className="relative w-full">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search presentations"
                        className="w-full bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 rounded-lg py-4 pl-6 pr-14 text-stone-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-lg"
                        autoComplete="off"
                    />
                    <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-800 focus:ring-orange-500 transition-colors">
                        <MagnifyingGlassIcon className="w-6 h-6"/>
                    </button>
                </form>
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg shadow-lg overflow-y-auto max-h-72">
                        {suggestions.map(suggestion => (
                            <li key={suggestion.name}>
                                <button
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-3 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors"
                                >
                                    {suggestion.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex items-center my-6">
                <div className="flex-grow border-t border-stone-300 dark:border-stone-600"></div>
                <span className="flex-shrink mx-4 text-stone-500 dark:text-stone-400 font-semibold">OR</span>
                <div className="flex-grow border-t border-stone-300 dark:border-stone-600"></div>
            </div>

            <SelectionButton 
                onClick={onSelectIndex}
                icon={<ListIcon className="w-8 h-8"/>}
                title="A-Z Presentation Index"
            />
            
            <div className="relative" ref={randomMenuRef}>
              <div className="flex rounded-lg shadow-lg overflow-hidden ring-1 ring-stone-200 dark:ring-stone-700">
                <button
                  onClick={() => onSelectRandom()}
                  className="w-full bg-stone-100 dark:bg-stone-800 p-6 hover:bg-white dark:hover:bg-stone-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 text-left flex items-center gap-6"
                >
                  <div className="flex-shrink-0 text-orange-500 dark:text-orange-400">
                      <ShuffleIcon className="w-8 h-8"/>
                  </div>
                  <div>
                      <h3 className="text-lg font-semibold text-stone-800 dark:text-white">Random Presentation</h3>
                  </div>
                </button>
                <button
                  onClick={() => setRandomMenuOpen(prev => !prev)}
                  aria-label="Select random difficulty"
                  className="p-4 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 transition-colors"
                >
                  <SettingsIcon className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                </button>
              </div>

              {isRandomMenuOpen && (
                <div className="absolute z-10 right-0 mt-2 w-56 bg-white dark:bg-stone-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fade-in">
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase">Filter by Difficulty</div>
                    {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => { onSelectRandom(difficulty); setRandomMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-600"
                      >
                        Random <span className={`font-semibold ${
                          difficulty === 'Easy' ? 'text-green-500' : difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                        }`}>{difficulty}</span> Presentation
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {appMode === 'learning' && user && (
              <SelectionButton 
                  onClick={onSelectReview}
                  icon={<CheckmarkIcon className="w-8 h-8"/>}
                  title="Review"
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default PresentationSelectionMethod;