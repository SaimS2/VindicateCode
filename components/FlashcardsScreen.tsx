import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SYSTEMS, FLASHCARD_PAIRS } from '../constants';
import { FlashcardSettings, CardProgress } from '../types';
import { SettingsIcon } from './icons/SettingsIcon';
import FlashcardSettingsModal from './FlashcardSettingsModal';

const DEFAULT_SETTINGS: FlashcardSettings = {
  againMinutes: 10,
  goodDays: 1,
  easyDays: 4,
  newCardsPerDay: 20,
};

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

interface FlashcardsScreenProps {
  onBack: () => void;
}

type FlashcardMode = 'presentation' | 'differential';
interface Flashcard {
  id: string;
  front: string;
  back: string[];
}
type Grade = 'again' | 'hard' | 'good' | 'easy';

const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<FlashcardMode>('presentation');
  const [selectedSystem, setSelectedSystem] = useState('All');
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<FlashcardSettings>(() => {
    try {
      const stored = localStorage.getItem('flashcardSettings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [progress, setProgress] = useState<Record<string, CardProgress>>(() => {
    try {
      const stored = localStorage.getItem('flashcardProgress');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const fullDeck = useMemo(() => {
    let filteredPairs = FLASHCARD_PAIRS;
    if (selectedSystem !== 'All') {
      filteredPairs = FLASHCARD_PAIRS.filter(p => p.system === selectedSystem);
    }

    if (mode === 'presentation') {
      return filteredPairs.map(pair => ({
        id: `p-${pair.presentation}`,
        front: pair.presentation,
        back: pair.differentials,
      }));
    } else {
      const differentialMap: { [key: string]: string[] } = {};
      filteredPairs.forEach(pair => {
        pair.differentials.forEach(diff => {
          if (!differentialMap[diff]) differentialMap[diff] = [];
          differentialMap[diff].push(pair.presentation);
        });
      });
      return Object.entries(differentialMap).map(([differential, presentations]) => ({
        id: `d-${differential}`,
        front: differential,
        back: presentations,
      }));
    }
  }, [mode, selectedSystem]);

  const buildReviewQueue = useCallback(() => {
    const now = Date.now();
    const dueCards: Flashcard[] = [];
    const newCards: Flashcard[] = [];

    fullDeck.forEach(card => {
      const cardProgress = progress[card.id];
      if (cardProgress) {
        if (cardProgress.reviewDate <= now) {
          dueCards.push(card);
        }
      } else {
        newCards.push(card);
      }
    });
    
    const shuffledNew = newCards.sort(() => Math.random() - 0.5);
    const newQueue = [...dueCards, ...shuffledNew.slice(0, settings.newCardsPerDay)];
    const finalQueue = newQueue.sort(() => Math.random() - 0.5);
    
    setReviewQueue(finalQueue);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [fullDeck, progress, settings.newCardsPerDay]);

  useEffect(() => {
    buildReviewQueue();
  }, [buildReviewQueue]);

  const handleSaveSettings = (newSettings: FlashcardSettings) => {
    setSettings(newSettings);
    localStorage.setItem('flashcardSettings', JSON.stringify(newSettings));
  };
  
  const handleGrade = (grade: Grade) => {
    if (!currentCard) return;

    const cardId = currentCard.id;
    const currentProgress = progress[cardId] || { 
      reviewDate: Date.now(), 
      intervalDays: 0, 
      easeFactor: INITIAL_EASE_FACTOR 
    };

    let newIntervalDays: number;
    let newEaseFactor = currentProgress.easeFactor;
    
    if (grade === 'again') {
        newIntervalDays = 0; // Will be shown again in 10 minutes
        newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2);
    } else {
        if (grade === 'hard') newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.15);
        if (grade === 'easy') newEaseFactor += 0.15;
        
        if (currentProgress.intervalDays === 0) { // New card graduation
            newIntervalDays = grade === 'easy' ? settings.easyDays : settings.goodDays;
        } else {
            let multiplier = grade === 'hard' ? 1.2 : 1.0;
            newIntervalDays = currentProgress.intervalDays * newEaseFactor * multiplier;
        }
    }

    const reviewDate = grade === 'again' 
      ? Date.now() + settings.againMinutes * 60 * 1000
      : Date.now() + newIntervalDays * 24 * 60 * 60 * 1000;

    const newProgress: CardProgress = { reviewDate, intervalDays: newIntervalDays, easeFactor: newEaseFactor };
    
    const updatedProgress = { ...progress, [cardId]: newProgress };
    setProgress(updatedProgress);
    localStorage.setItem('flashcardProgress', JSON.stringify(updatedProgress));

    // Move to next card
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  const handleShuffleAll = useCallback(() => {
    const shuffledDeck = [...fullDeck].sort(() => Math.random() - 0.5);
    setReviewQueue(shuffledDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [fullDeck]);
  
  const currentCard = reviewQueue[currentIndex];

  const getModeButtonClass = (buttonMode: FlashcardMode) => `px-4 py-2 font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 ${
      mode === buttonMode 
        ? 'bg-orange-600 text-white' 
        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
    }`;
  
  const getGradingButtonClass = (color: string) => `flex-1 py-3 px-2 rounded-md font-semibold text-white transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 dark:focus:ring-offset-stone-800 ${color}`;


  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Home</button>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-stone-700 dark:text-stone-300">Flashcards</h2>
              <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-full bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors">
                <SettingsIcon className="w-5 h-5 text-stone-700 dark:text-stone-200" />
              </button>
            </div>
        </div>

        <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg shadow-lg mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Mode</label>
                    <div className="flex gap-2">
                        <button onClick={() => setMode('presentation')} className={getModeButtonClass('presentation')}>Presentation &rarr; Differential</button>
                        <button onClick={() => setMode('differential')} className={getModeButtonClass('differential')}>Differential &rarr; Presentation</button>
                    </div>
                </div>
                <div className="flex-1 sm:max-w-xs">
                    <label htmlFor="system-select" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Filter by System</label>
                     <select 
                        id="system-select"
                        value={selectedSystem} 
                        onChange={e => setSelectedSystem(e.target.value)}
                        className="w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                        <option value="All">All Systems</option>
                        {SYSTEMS.map(sys => <option key={sys} value={sys}>{sys}</option>)}
                    </select>
                </div>
            </div>
            <div className="pt-4 border-t border-stone-300 dark:border-stone-700">
                <button
                    onClick={handleShuffleAll}
                    className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    aria-label={`Shuffle all ${fullDeck.length} cards in the current deck`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 3 21 3 21 8"></polyline>
                        <line x1="4" y1="20" x2="21" y2="3"></line>
                        <polyline points="21 16 21 21 16 21"></polyline>
                        <line x1="15" y1="15" x2="21" y2="21"></line>
                        <line x1="4" y1="4" x2="9" y2="9"></line>
                    </svg>
                    Shuffle All Cards ({fullDeck.length})
                </button>
            </div>
        </div>

        {currentCard ? (
            <>
                <div className="perspective-1000 mb-4 h-80">
                    <div 
                        className={`relative w-full h-full cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                        aria-live="polite"
                    >
                        <div className="absolute w-full h-full backface-hidden bg-stone-200 dark:bg-stone-700 rounded-xl shadow-xl flex items-center justify-center p-6 text-center">
                            <h3 className="text-3xl font-bold text-stone-800 dark:text-stone-100">{currentCard.front}</h3>
                        </div>
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-stone-300 dark:bg-stone-900 rounded-xl shadow-xl flex flex-col justify-center p-6 overflow-y-auto text-center">
                             <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3">{currentCard.front}</h4>
                             <ul className="space-y-2">
                                {currentCard.back.map((item, index) => (
                                    <li key={index} className="text-stone-700 dark:text-stone-300 text-lg">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                {isFlipped ? (
                    <div className="flex items-center justify-between gap-2 sm:gap-4 animate-fade-in">
                        <button onClick={() => handleGrade('again')} className={getGradingButtonClass('bg-red-600 hover:bg-red-700 focus:ring-red-500')}>Again</button>
                        <button onClick={() => handleGrade('hard')} className={getGradingButtonClass('bg-orange-500 hover:bg-orange-600 focus:ring-orange-400')}>Hard</button>
                        <button onClick={() => handleGrade('good')} className={getGradingButtonClass('bg-orange-600 hover:bg-orange-700 focus:ring-orange-500')}>Good</button>
                        <button onClick={() => handleGrade('easy')} className={getGradingButtonClass('bg-green-600 hover:bg-green-700 focus:ring-green-500')}>Easy</button>
                    </div>
                ) : (
                    <div className="h-[52px] flex items-center justify-center">
                        <p className="text-stone-500 dark:text-stone-400">Click card to reveal answer</p>
                    </div>
                )}
            </>
        ) : (
            <div className="text-center py-20 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-inner h-[420px] flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-2">Congratulations!</h3>
                <p className="max-w-md">You've finished all available cards for this session. Come back tomorrow for new reviews!</p>
            </div>
        )}

      <FlashcardSettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onSave={handleSaveSettings} />
    </div>
  );
};

export default FlashcardsScreen;