import React, { useState, useMemo, useEffect } from 'react';
import { Presentation, User } from '../types';

interface PresentationListProps {
  presentationsBySystem: { [key: string]: Presentation[] };
  onSelect: (presentation: Presentation) => void;
  onBack: () => void;
  onSelectRandom: () => void;
  user: User | null;
  mode: 'search' | 'index';
  initialSearchTerm?: string;
}

const PresentationList: React.FC<PresentationListProps> = ({ presentationsBySystem, onSelect, onBack, onSelectRandom, user, mode, initialSearchTerm }) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [selectedLetter, setSelectedLetter] = useState(mode === 'index' ? '' : 'All');

    const presentationsToShow = useMemo(() => {
        const allPresentations = Object.values(presentationsBySystem).flat();
        const uniquePresentations = Array.from(new Map(allPresentations.map((p: Presentation) => [p.name, p])).values());
        return uniquePresentations;
    }, [presentationsBySystem]);
    
    useEffect(() => {
        if (mode === 'index') {
            setSelectedLetter('');
        } else {
            setSelectedLetter('All');
        }
        setSearchTerm(initialSearchTerm || '');
    }, [presentationsToShow, mode, initialSearchTerm]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    const availableLetters = useMemo(() => {
        const letters = new Set<string>();
        presentationsToShow.forEach(p => {
            if (p.name && p.name.length > 0) {
                letters.add(p.name[0].toUpperCase());
            }
        });
        return letters;
    }, [presentationsToShow]);

    const filteredPresentations = useMemo(() => {
        const sortedPresentations = [...presentationsToShow].sort((a, b) => a.name.localeCompare(b.name));

        if (mode === 'index' && !searchTerm && !selectedLetter) {
            return [];
        }

        if (searchTerm) {
            return sortedPresentations.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        
        if (mode === 'search' && selectedLetter === 'All') {
            return sortedPresentations;
        }

        return sortedPresentations.filter(p => p.name.toUpperCase().startsWith(selectedLetter));
    }, [presentationsToShow, searchTerm, selectedLetter, mode]);

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">
                &larr; Back to Selection Method
            </button>
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-300">Select Presentation</h2>
                {mode === 'search' && (
                    <button
                        onClick={onSelectRandom}
                        className="bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold py-2 px-4 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
                    >
                        Random Presentation
                    </button>
                )}
            </div>
        </div>

        {mode === 'search' && (
            <div className="mb-4">
                <input 
                    type="text"
                    placeholder="Search presentations (e.g., Chest Pain)"
                    className="w-full bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-md py-3 px-4 text-stone-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        )}

        <div className="mb-6">
            <label htmlFor="letter-select" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Filter by Letter
            </label>
            <select
                id="letter-select"
                value={searchTerm ? '' : selectedLetter}
                onChange={(e) => {
                    setSelectedLetter(e.target.value);
                    setSearchTerm(''); 
                }}
                aria-label="Filter presentations by first letter"
                className="w-full sm:w-auto bg-stone-200 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2.5 px-3 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
                {mode === 'index' && !searchTerm && <option value="" disabled>Select a letter...</option>}
                <option value="" disabled hidden={!searchTerm}>
                    - Searching -
                </option>
                {mode === 'search' && <option value="All">All</option>}
                {alphabet.map(letter => (
                    <option
                        key={letter}
                        value={letter}
                        disabled={!availableLetters.has(letter)}
                    >
                        {letter}
                    </option>
                ))}
            </select>
        </div>
        
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresentations.length > 0 ? (
            filteredPresentations.map((p) => (
              <button
                key={p.name}
                onClick={() => onSelect(p)}
                className="bg-stone-100 dark:bg-stone-800 text-left p-4 rounded-lg shadow-md hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-orange-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <p className="font-medium text-stone-800 dark:text-white">{p.name}</p>
              </button>
            ))
        ) : (
            <div className="col-span-full text-center py-8 text-stone-500 dark:text-stone-400">
                <p>
                    {mode === 'index' && !selectedLetter && !searchTerm
                            ? 'Please select a letter from the filter to view presentations.'
                            : searchTerm 
                                ? `No presentations found for "${searchTerm}".`
                                : `No presentations found starting with the letter "${selectedLetter}".`
                    }
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PresentationList;