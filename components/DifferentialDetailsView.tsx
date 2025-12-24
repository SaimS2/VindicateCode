

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Differential, Difficulty } from '../types';
import { ClockIcon } from './icons/ClockIcon';

interface DifferentialDetailsViewProps {
  differential: Differential;
  onClose: () => void;
}

type TabKey = 'pathophysiology' | 'signsAndSymptoms' | 'patientHistory' | 'physicalExamSigns' | 'labs' | 'imaging' | 'treatmentOptions';

const TABS: { key: TabKey, title: string }[] = [
  { key: 'pathophysiology', title: 'Pathophysiology' },
  { key: 'signsAndSymptoms', title: 'Signs & Symptoms' },
  { key: 'patientHistory', title: 'History' },
  { key: 'physicalExamSigns', title: 'Exam' },
  { key: 'labs', title: 'Labs' },
  { key: 'imaging', title: 'Imaging' },
  { key: 'treatmentOptions', title: 'Treatment' },
];

const DetailFlashcard: React.FC<{ content: string, isFlipped: boolean, onFlip: () => void }> = ({ content, isFlipped, onFlip }) => {
  return (
    <div className="perspective-1000 h-full">
      <div
        onClick={onFlip}
        className={`relative w-full h-full min-h-[120px] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        role="button"
        tabIndex={0}
      >
        {/* Front */}
        <div className="absolute w-full h-full backface-hidden bg-stone-200 dark:bg-stone-700 p-4 rounded-lg shadow-md flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600">
          <span className="text-5xl font-bold text-stone-400 dark:text-stone-500 select-none">?</span>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-stone-200 dark:bg-stone-700 p-4 rounded-lg shadow-md flex items-center justify-center text-center">
          <p className="text-stone-800 dark:text-stone-200">{content}</p>
        </div>
      </div>
    </div>
  );
};

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};


const DifferentialDetailsView: React.FC<DifferentialDetailsViewProps> = ({ differential, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('pathophysiology');
  const [shuffledData, setShuffledData] = useState<Record<TabKey, string[]>>({} as any);
  const [flippedCards, setFlippedCards] = useState<Record<TabKey, Set<string>>>({} as any);
  const [timers, setTimers] = useState<Record<TabKey, { seconds: number; isActive: boolean }>>({} as any);
  const [difficultyRatings, setDifficultyRatings] = useState<Record<TabKey, Difficulty | null>>({} as any);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const initialShuffledData: Record<TabKey, string[]> = {} as any;
    const initialFlipped: Record<TabKey, Set<string>> = {} as any;
    const initialTimers: Record<TabKey, { seconds: number; isActive: boolean }> = {} as any;
    const initialRatings: Record<TabKey, Difficulty | null> = {} as any;
    
    TABS.forEach(tab => {
        const content = differential[tab.key];
        initialShuffledData[tab.key] = Array.isArray(content) ? [...content] : [content].filter(Boolean);
        initialFlipped[tab.key] = new Set();
        initialTimers[tab.key] = { seconds: 0, isActive: false };
        initialRatings[tab.key] = null;
    });

    setShuffledData(initialShuffledData);
    setFlippedCards(initialFlipped);
    setTimers(initialTimers);
    setDifficultyRatings(initialRatings);
    setActiveTab('pathophysiology'); // Reset to first tab on new differential
  }, [differential]);

  useEffect(() => {
    if (timers[activeTab]?.isActive) {
      timerRef.current = window.setInterval(() => {
        setTimers(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], seconds: prev[activeTab].seconds + 1 } }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timers, activeTab]);

  const handleShuffle = () => {
    const currentData = [...shuffledData[activeTab]];
    for (let i = currentData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentData[i], currentData[j]] = [currentData[j], currentData[i]];
    }
    setShuffledData(prev => ({ ...prev, [activeTab]: currentData }));
  };

  const handleRevealAll = () => {
    const allItems = new Set(shuffledData[activeTab]);
    setFlippedCards(prev => ({ ...prev, [activeTab]: allItems }));
  };

  const handleHideAll = () => {
    setFlippedCards(prev => ({ ...prev, [activeTab]: new Set() }));
  };
  
  const handleFlip = (item: string) => {
      const newSet = new Set(flippedCards[activeTab]);
      if (newSet.has(item)) {
          newSet.delete(item);
      } else {
          newSet.add(item);
      }
      setFlippedCards(prev => ({...prev, [activeTab]: newSet}));
  };
  
  const handleToggleTimer = () => {
    setTimers(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], isActive: !prev[activeTab].isActive } }));
  };

  const handleResetTimer = () => {
    setTimers(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], seconds: 0, isActive: false } }));
  };

  const handleRateDifficulty = (difficulty: Difficulty) => {
    setDifficultyRatings(prev => ({ ...prev, [activeTab]: difficulty }));
    handleHideAll();
    setTimers(prev => ({ ...prev, [activeTab]: { seconds: 0, isActive: false } }));
  };

  const currentTabContent = useMemo(() => shuffledData[activeTab] || [], [shuffledData, activeTab]);
  const allCardsInTabFlipped = currentTabContent.length > 0 && flippedCards[activeTab]?.size === currentTabContent.length;

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-200">{differential.name}</h2>
             <p className="text-sm text-stone-500 dark:text-stone-400">
                Explore the key features of this diagnosis.
            </p>
          </div>
          <button onClick={onClose} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Differentials</button>
        </div>
        
        <div className="flex-shrink-0 border-b border-stone-300 dark:border-stone-700">
             <nav className="flex flex-wrap -mb-px">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold border-b-4 transition-colors focus:outline-none ${
                            activeTab === tab.key
                            ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                            : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                        }`}
                    >
                        {tab.title}
                    </button>
                ))}
             </nav>
        </div>

        <div className="mt-4">
            {currentTabContent.length > 0 && (
                <div className="flex justify-between items-center gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                        <span className="font-mono text-lg font-semibold text-stone-700 dark:text-stone-200">{formatTime(timers[activeTab]?.seconds || 0)}</span>
                        <button onClick={handleToggleTimer} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors w-16">
                          {timers[activeTab]?.isActive ? 'Stop' : 'Start'}
                        </button>
                        <button onClick={handleResetTimer} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors">
                          Reset
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRevealAll} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors">Reveal All</button>
                        <button onClick={handleHideAll} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors">Hide All</button>
                        <button onClick={handleShuffle} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors">Shuffle Cards</button>
                    </div>
                </div>
            )}
            
            {currentTabContent.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTabContent.map((item, index) => (
                            <DetailFlashcard
                                key={`${activeTab}-${index}-${item}`}
                                content={item}
                                isFlipped={flippedCards[activeTab]?.has(item)}
                                onFlip={() => handleFlip(item)}
                            />
                        ))}
                    </div>
                    {allCardsInTabFlipped && (
                        <div className="mt-6 p-4 bg-stone-200 dark:bg-stone-700/50 rounded-lg animate-fade-in">
                            <h4 className="text-center font-semibold text-stone-700 dark:text-stone-300 mb-3">How difficult was this category?</h4>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => handleRateDifficulty('Easy')} className="px-6 py-2 rounded-md font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">Easy</button>
                                <button onClick={() => handleRateDifficulty('Medium')} className="px-6 py-2 rounded-md font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">Medium</button>
                                <button onClick={() => handleRateDifficulty('Hard')} className="px-6 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Hard</button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full min-h-[150px] text-center text-stone-500 dark:text-stone-400">
                    <p>No specific information available for this category.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default DifferentialDetailsView;