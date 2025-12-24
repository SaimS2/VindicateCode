

import React, { useState, useEffect, useCallback } from 'react';
import { MCQ, User } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface SavedScenariosScreenProps {
  user: User;
  onBack: () => void;
}

const SavedScenariosScreen: React.FC<SavedScenariosScreenProps> = ({ user, onBack }) => {
  const [savedScenarios, setSavedScenarios] = useState<MCQ[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const storageKey = `savedScenarios-${user.email}`;

  useEffect(() => {
    try {
      const scenariosRaw = localStorage.getItem(storageKey);
      if (scenariosRaw) {
        setSavedScenarios(JSON.parse(scenariosRaw));
      }
    } catch (error) {
      console.error("Failed to load saved scenarios:", error);
      setSavedScenarios([]);
    }
  }, [storageKey]);

  const handleDelete = (idToDelete: string | undefined) => {
    if (!idToDelete) return;

    if (window.confirm("Are you sure you want to delete this saved scenario?")) {
        const updatedScenarios = savedScenarios.filter(s => s.id !== idToDelete);
        setSavedScenarios(updatedScenarios);
        localStorage.setItem(storageKey, JSON.stringify(updatedScenarios));
    }
  };

  const toggleExpand = (id: string | undefined) => {
    if (!id) return;
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Home</button>
        <h2 className="text-3xl font-bold text-stone-700 dark:text-stone-300">Saved Scenarios</h2>
      </div>

      {savedScenarios.length === 0 ? (
        <div className="text-center py-20 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-inner">
            <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-stone-400 dark:text-stone-500" />
            <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-2">No Saved Scenarios Yet</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {savedScenarios.map((mcq) => (
            <div key={mcq.id} className="bg-stone-100 dark:bg-stone-800 rounded-lg shadow-md transition-all">
              <div 
                className="p-4 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpand(mcq.id)}
              >
                <p className="font-medium text-stone-800 dark:text-stone-200 pr-4">{mcq.scenario.substring(0, 100)}...</p>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(mcq.id); }}
                        className="p-2 text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        aria-label="Delete scenario"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <svg className={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform ${expandedId === mcq.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
              </div>
              
              {expandedId === mcq.id && (
                <div className="p-4 border-t border-stone-300 dark:border-stone-700 space-y-4 animate-fade-in">
                    <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Full Scenario:</h4>
                        <p className="text-stone-800 dark:text-stone-300 whitespace-pre-wrap">{mcq.scenario}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">{mcq.question}</h4>
                        <div className="space-y-2">
                        {mcq.options.map((option, index) => (
                            <div
                            key={index}
                            className={`w-full text-left p-3 rounded-md ${option === mcq.correctAnswer ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200 font-semibold' : 'bg-stone-200 dark:bg-stone-700'}`}
                            >
                            {option}
                            </div>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Rationale:</h4>
                        <p className="text-stone-800 dark:text-stone-300">{mcq.rationale}</p>
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedScenariosScreen;