

import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { PresentationFilters, Differential, Demographic, VindicateCategory, Chronicity, BiologicalSex, Difficulty, User } from '../types';
import { AppContext } from '../contexts/AppContext';
import { VINDICATE_CATEGORIES, DEMOGRAPHIC_CONFIGS, getAgeGroup, CHRONICITY_OPTIONS } from '../constants';
import { generateDifferentials } from '../services/geminiService';
import DifferentialDetailsView from './DifferentialDetailsView';
import { ClockIcon } from './icons/ClockIcon';

const DifferentialFlashcard: React.FC<{ 
    differential: Differential; 
    isFlipped: boolean;
    onFlip: () => void;
}> = ({ differential, isFlipped, onFlip }) => {
  return (
    <div className="perspective-1000 h-full">
      <div
        onClick={onFlip}
        className={`relative w-full h-full min-h-[160px] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''} ${isFlipped && differential.isCritical ? 'animate-pulse-border rounded-lg' : ''}`}
        aria-live="polite"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onFlip(); }}
      >
        {/* Front of the card */}
        <div 
            className="absolute w-full h-full backface-hidden bg-stone-200 dark:bg-stone-700 p-4 rounded-lg shadow-md flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-600"
            aria-label="Reveal differential"
        >
          <span className="text-8xl font-bold text-stone-400 dark:text-stone-500 select-none">?</span>
        </div>

        {/* Back of the card */}
        <div 
          className="absolute w-full h-full backface-hidden rotate-y-180 bg-stone-200 dark:bg-stone-700 p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center"
        >
           <h4 className="font-bold text-stone-900 dark:text-white text-xl">{differential.name}</h4>
        </div>
      </div>
    </div>
  );
};


interface CaseViewProps {
  user: User | null;
  presentationName: string;
  demographic: Demographic;
  onBack: () => void;
  onDifferentialsLearned: (differentials: Differential[]) => void;
  initialCategory?: VindicateCategory | null;
}

const VINDICATE_TABS: Record<VindicateCategory, { letter: string; name: string; fullName: string }> = {
    [VindicateCategory.Vascular]: { letter: 'V', name: 'Vascular', fullName: 'Vascular' },
    [VindicateCategory.Infectious]: { letter: 'I', name: 'Infectious', fullName: 'Infectious/Inflammatory' },
    [VindicateCategory.Neoplastic]: { letter: 'N', name: 'Neoplastic', fullName: 'Neoplastic' },
    [VindicateCategory.Degenerative]: { letter: 'D', name: 'Degenerative', fullName: 'Degenerative/Deficiency/Drugs' },
    [VindicateCategory.Iatrogenic]: { letter: 'I', name: 'Iatrogenic', fullName: 'Idiopathic/Intoxication/Iatrogenic' },
    [VindicateCategory.Congeneric]: { letter: 'C', name: 'Congenital', fullName: 'Congenital' },
    [VindicateCategory.Autoimmune]: { letter: 'A', name: 'Autoimmune', fullName: 'Autoimmune/Allergic/Anatomic' },
    [VindicateCategory.Traumatic]: { letter: 'T', name: 'Traumatic', fullName: 'Traumatic' },
    [VindicateCategory.Endocrine]: { letter: 'E', name: 'Endocrine', fullName: 'Endocrine/Metabolic' },
};

const vindicateOrder: VindicateCategory[] = [
    VindicateCategory.Vascular, VindicateCategory.Infectious, VindicateCategory.Neoplastic,
    VindicateCategory.Degenerative, VindicateCategory.Iatrogenic, VindicateCategory.Congeneric,
    VindicateCategory.Autoimmune, VindicateCategory.Traumatic, VindicateCategory.Endocrine,
];

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};


const CaseView: React.FC<CaseViewProps> = ({ user, presentationName, demographic, onBack, onDifferentialsLearned, initialCategory }) => {
  const { appMode } = useContext(AppContext);
  const [differentials, setDifferentials] = useState<Differential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);

  const config = DEMOGRAPHIC_CONFIGS[demographic];
  const [chronicity, setChronicity] = useState<Chronicity>(CHRONICITY_OPTIONS[2]);
  const [sex, setSex] = useState<BiologicalSex>(config.lockedSex || 'Female');
  const [age, setAge] = useState(config.default);

  const chronicityIndex = CHRONICITY_OPTIONS.indexOf(chronicity);

  const [activeCategory, setActiveCategory] = useState<VindicateCategory>(vindicateOrder[0]);
  const [selectedDifferentialForDetails, setSelectedDifferentialForDetails] = useState<Differential | null>(null);
  const [categorizedDifferentials, setCategorizedDifferentials] = useState<Record<string, Differential[]>>({});
  // FIX: Cast the initial empty object to the correct Record type to resolve a TypeScript error where an empty object is not assignable to a Record.
  const [flippedCards, setFlippedCards] = useState<Record<VindicateCategory, Set<string>>>({} as Record<VindicateCategory, Set<string>>);
  
  // FIX: Cast the initial empty object to the correct Record type to resolve a TypeScript error.
  const [timers, setTimers] = useState<Record<VindicateCategory, { seconds: number; isActive: boolean }>>({} as Record<VindicateCategory, { seconds: number; isActive: boolean }>);
  // FIX: Cast the initial empty object to the correct Record type to resolve a TypeScript error.
  const [difficultyRatings, setDifficultyRatings] = useState<Record<VindicateCategory, Difficulty | null>>({} as Record<VindicateCategory, Difficulty | null>);
  const timerRef = useRef<number | null>(null);

  const filteredDifferentials = useMemo(() => {
    let diffs = showOnlyCritical ? differentials.filter(d => d.isCritical) : differentials;
    if (appMode === 'clinical') {
      return diffs.filter(d => d.category === activeCategory);
    }
    return diffs;
  }, [differentials, showOnlyCritical, appMode, activeCategory]);

  useEffect(() => {
    // Set loading state immediately on filter change to give user feedback
    setIsLoading(true);

    const handler = setTimeout(() => {
      const fetchDifferentials = async () => {
        setError(null);
        try {
          const filters: PresentationFilters = { chronicity, sex, age };
          const newDifferentials = await generateDifferentials(presentationName, filters, demographic);
          setDifferentials(newDifferentials);
        } catch (err: any) {
          let errorMessage = "Failed to generate differentials. The AI may be busy or an error occurred. Please try adjusting the filters or try again later.";
          if (err.message && err.message.toLowerCase().includes('quota')) {
              errorMessage = "API request limit reached. Please wait a moment before trying again or check your billing details.";
          }
          setError(errorMessage);
          setDifferentials([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDifferentials();
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [presentationName, demographic, chronicity, sex, age]);
  
  useEffect(() => {
    const newCategorized: Record<string, Differential[]> = {};
    const initialTimers: Record<VindicateCategory, { seconds: number; isActive: boolean }> = {} as any;
    const initialRatings: Record<VindicateCategory, Difficulty | null> = {} as any;
    const initialFlipped: Record<VindicateCategory, Set<string>> = {} as any;
    
    const diffsToCategorize = showOnlyCritical ? differentials.filter(d => d.isCritical) : differentials;

    vindicateOrder.forEach(cat => {
      newCategorized[cat] = diffsToCategorize.filter(d => d.category === cat);
      initialTimers[cat] = { seconds: 0, isActive: false };
      initialRatings[cat] = null;
      initialFlipped[cat] = new Set();
    });
    setCategorizedDifferentials(newCategorized);
    setTimers(initialTimers);
    setDifficultyRatings(initialRatings);
    setFlippedCards(initialFlipped);
    setSelectedDifferentialForDetails(null);
    
    if (diffsToCategorize.length > 0) {
      onDifferentialsLearned(diffsToCategorize);
      const initialCatIsValid = initialCategory && newCategorized[initialCategory]?.length > 0;
      if (initialCatIsValid) {
        setActiveCategory(initialCategory);
      } else {
        const firstCategoryWithDiffs = vindicateOrder.find(catKey => newCategorized[catKey].length > 0);
        setActiveCategory(firstCategoryWithDiffs || vindicateOrder[0]);
      }
    }
  }, [differentials, showOnlyCritical, onDifferentialsLearned, initialCategory]);

  useEffect(() => {
    if (timers[activeCategory]?.isActive) {
      timerRef.current = window.setInterval(() => {
        setTimers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], seconds: prev[activeCategory].seconds + 1 } }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timers, activeCategory]);

  const handleShuffle = (category: VindicateCategory) => {
    setCategorizedDifferentials(prev => {
      const categoryDiffs = [...(prev[category] || [])];
      for (let i = categoryDiffs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [categoryDiffs[i], categoryDiffs[j]] = [categoryDiffs[j], categoryDiffs[i]];
      }
      return { ...prev, [category]: categoryDiffs };
    });
  };

  const handleFlip = (differentialName: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev[activeCategory]);
      newSet.has(differentialName) ? newSet.delete(differentialName) : newSet.add(differentialName);
      return { ...prev, [activeCategory]: newSet };
    });
  };
  
  const handleRevealAll = (category: VindicateCategory) => {
    const diffsInCategory = (categorizedDifferentials[category] || []).map(d => d.name);
    setFlippedCards(prev => ({ ...prev, [category]: new Set(diffsInCategory) }));
  };

  const handleHideAll = (category: VindicateCategory) => {
    setFlippedCards(prev => ({ ...prev, [category]: new Set() }));
  };
  
  const handleToggleTimer = () => {
    setTimers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], isActive: !prev[activeCategory].isActive } }));
  };

  const handleResetTimer = () => {
    setTimers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], seconds: 0, isActive: false } }));
  };

  const handleRateDifficulty = (difficulty: Difficulty) => {
    if (user) {
        try {
            const key = `presentationRatings-${user.email}`;
            const storedRatingsRaw = localStorage.getItem(key);
            const storedRatings: Record<string, Record<string, Record<string, Difficulty>>> = storedRatingsRaw ? JSON.parse(storedRatingsRaw) : {};
            
            if (!storedRatings[demographic]) {
                storedRatings[demographic] = {};
            }
            if (!storedRatings[demographic][presentationName]) {
                storedRatings[demographic][presentationName] = {};
            }
            storedRatings[demographic][presentationName][activeCategory] = difficulty;

            localStorage.setItem(key, JSON.stringify(storedRatings));
        } catch (error) {
            console.error("Failed to save presentation rating:", error);
        }
    }

    setDifficultyRatings(prev => ({ ...prev, [activeCategory]: difficulty }));
    handleHideAll(activeCategory);
    setTimers(prev => ({ ...prev, [activeCategory]: { seconds: 0, isActive: false } }));
  };

  const handleTabClick = (categoryKey: VindicateCategory) => {
    setTimers(prev => ({ ...prev, [activeCategory]: { ...prev[activeCategory], isActive: false } }));
    setActiveCategory(categoryKey);
  };
  
  const activeCatInfo = VINDICATE_CATEGORIES[activeCategory];
  const differentialsForCategory = categorizedDifferentials[activeCategory] || [];
  const allCardsFlipped = differentialsForCategory.length > 0 && flippedCards[activeCategory]?.size === differentialsForCategory.length;

  const renderFilterControls = () => (
    <div className="bg-stone-200 dark:bg-stone-800 p-3 rounded-lg shadow-md mb-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Age */}
            <div className="flex-1">
                <label htmlFor="age" className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Age: <span className="text-orange-600 dark:text-orange-400 font-bold">{age} {config.unit}</span> <span className="text-xs font-normal text-stone-500 dark:text-stone-400">({getAgeGroup(age, demographic)})</span>
                </label>
                <input id="age" type="range" min={config.min} max={config.max} value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500" />
            </div>
            {/* Sex */}
            <div className="flex-1">
                <label className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-2">Sex</label>
                <div className="flex gap-2">
                    {(['Female', 'Male'] as BiologicalSex[]).map(s => (
                        <button type="button" key={s} onClick={() => setSex(s)} disabled={!!config.lockedSex && s !== config.lockedSex}
                            className={`flex-1 py-1 px-2 text-sm rounded-md font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 ${sex === s ? 'bg-orange-500 text-white' : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300'} ${!!config.lockedSex && s !== config.lockedSex ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            {/* Chronicity */}
            <div className="flex-1">
                <label htmlFor="chronicity" className="block text-sm font-semibold text-stone-800 dark:text-stone-200 mb-1">
                    Chronicity: <span className="text-orange-600 dark:text-orange-400 font-bold">{chronicity}</span>
                </label>
                <input id="chronicity" type="range" min="0" max={CHRONICITY_OPTIONS.length - 1} value={chronicityIndex}
                    onChange={(e) => setChronicity(CHRONICITY_OPTIONS[parseInt(e.target.value, 10)])}
                    className="w-full h-2 bg-stone-300 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-stone-300 dark:border-stone-700 flex justify-center items-center">
            <label htmlFor="critical-toggle" className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    id="critical-toggle" 
                    className="sr-only peer"
                    checked={showOnlyCritical}
                    onChange={() => setShowOnlyCritical(prev => !prev)}
                />
                <div className="w-11 h-6 bg-stone-400 dark:bg-stone-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                <span className="ml-3 text-sm font-semibold text-stone-800 dark:text-stone-200">Do not miss</span>
            </label>
        </div>
    </div>
  );

  const renderMainContent = () => {
    if (selectedDifferentialForDetails) {
        return <DifferentialDetailsView differential={selectedDifferentialForDetails} onClose={() => setSelectedDifferentialForDetails(null)} />;
    }
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-stone-600 dark:text-stone-300">Generating AI Differentials...</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-lg"><p>{error}</p></div>;
    }

    const currentDifferentials = appMode === 'clinical' ? filteredDifferentials : differentialsForCategory;

    if (differentials.length > 0 && currentDifferentials.length === 0) {
        return (
            <div className="text-center py-10 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-xl p-4 min-h-[300px]">
                <p className="font-semibold text-lg">
                    {showOnlyCritical ? "No 'Do not miss' diagnoses found for this category." : `No differentials found for the ${activeCatInfo.name} category.`}
                </p>
                <p className="mt-2">Try adjusting the demographic filters or selecting another VINDICATE category.</p>
            </div>
        );
    }


    return (
        <>
        <div className="border-b border-stone-300 dark:border-stone-700 mb-4">
            <nav className="flex flex-wrap justify-center sm:justify-around -mb-px">
            {vindicateOrder.map(catKey => {
                const tabInfo = VINDICATE_TABS[catKey]; const catInfo = VINDICATE_CATEGORIES[catKey];
                const differentialsExist = categorizedDifferentials[catKey]?.length > 0;
                return (
                    <button key={catKey} onClick={() => handleTabClick(catKey)}
                        className={`group flex-grow sm:flex-grow-0 sm:flex-1 py-3 px-1 text-center font-bold border-b-4 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500
                        ${activeCategory === catKey ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600'}
                        ${!differentialsExist ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={!differentialsExist} title={tabInfo.fullName}>
                        <span className={`text-xl ${catInfo.color.replace('bg','text')}`}>{tabInfo.letter}</span>
                        <span className="hidden sm:block text-xs font-semibold tracking-wide uppercase mt-1">{tabInfo.name}</span>
                    </button>
                );
            })}
            </nav>
        </div>
        <div className="bg-stone-100 dark:bg-stone-800 rounded-lg shadow-xl p-4 min-h-[300px]">
            {appMode === 'learning' && differentialsForCategory.length > 0 && (
            <div className="flex justify-between items-center gap-2 mb-4 border-b border-stone-300 dark:border-stone-700 pb-3">
                <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-stone-500 dark:text-stone-400" />
                    <span className="font-mono text-lg font-semibold text-stone-700 dark:text-stone-200">{formatTime(timers[activeCategory]?.seconds || 0)}</span>
                    <button onClick={handleToggleTimer} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors w-16">
                      {timers[activeCategory]?.isActive ? 'Stop' : 'Start'}
                    </button>
                    <button onClick={handleResetTimer} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">
                      Reset
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleRevealAll(activeCategory)} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">Reveal All</button>
                    <button onClick={() => handleHideAll(activeCategory)} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">Hide All</button>
                    <button onClick={() => handleShuffle(activeCategory)} className="text-xs font-semibold px-3 py-1 rounded-md bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 transition-colors">Shuffle</button>
                </div>
            </div>
            )}
            {currentDifferentials.length > 0 ? (
                appMode === 'clinical' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentDifferentials.map(d => (
                        <div key={d.name} className={`bg-stone-200 dark:bg-stone-800/60 p-4 rounded-lg shadow-md flex items-center justify-center min-h-[100px] border-2 ${d.isCritical ? 'border-transparent animate-pulse-border' : 'border-transparent'}`}>
                            <h4 className="font-bold text-lg text-stone-900 dark:text-white text-center">{d.name}</h4>
                        </div>
                    ))}
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {differentialsForCategory.map(d => (
                        <DifferentialFlashcard key={d.name} differential={d}
                        isFlipped={flippedCards[activeCategory]?.has(d.name)} onFlip={() => handleFlip(d.name)} />
                    ))}
                    </div>
                    {allCardsFlipped && (
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
                )
            ) : (
                <div className="flex items-center justify-center h-full min-h-[250px] text-center text-stone-500 dark:text-stone-400">
                <p>There are no differentials that fit in the <span className="font-semibold">{activeCatInfo.name}</span> category for this presentation and filter set.</p>
                </div>
            )}
        </div>
        </>
    );
  };


  return (
    <div className="p-4 md:p-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        { !selectedDifferentialForDetails &&
            <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Selection Method</button>
        }
      </div>
      { !selectedDifferentialForDetails && 
        <>
            <h2 className="text-3xl font-bold mb-2">{presentationName}</h2>
            {renderFilterControls()}
        </>
      }
      {renderMainContent()}
    </div>
  );
};

export default CaseView;