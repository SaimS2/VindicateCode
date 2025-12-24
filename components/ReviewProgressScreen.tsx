

import React, { useState, useEffect, useMemo } from 'react';
import { User, Difficulty, Demographic, VindicateCategory } from '../types';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { BrainIcon } from './icons/BrainIcon';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { CheckmarkIcon } from './icons/CheckmarkIcon';


interface ReviewProgressScreenProps {
  user: User;
  onBack: () => void;
  onSelectReviewItem: (demographic: Demographic, presentationName: string, category: VindicateCategory) => void;
}

type ProgressData = Record<Demographic, Record<string, Record<string, Difficulty>>>;

type RatedItem = {
    demographic: Demographic;
    presentationName: string;
    category: VindicateCategory;
    difficulty: Difficulty;
};

const StatCard: React.FC<{ title: string; value: number; colorClass: string; icon: React.ReactNode }> = ({ title, value, colorClass, icon }) => (
    <div className="bg-stone-200 dark:bg-stone-700/60 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className={`p-3 rounded-full bg-opacity-20 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">{value}</div>
            <div className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</div>
        </div>
    </div>
);


const ReviewProgressScreen: React.FC<ReviewProgressScreenProps> = ({ user, onBack, onSelectReviewItem }) => {
  const [progress, setProgress] = useState<ProgressData>({} as ProgressData);

  useEffect(() => {
    try {
      const key = `presentationRatings-${user.email}`;
      const storedRatingsRaw = localStorage.getItem(key);
      const storedRatings: ProgressData = storedRatingsRaw ? JSON.parse(storedRatingsRaw) : ({} as ProgressData);
      setProgress(storedRatings);
    } catch (error) {
      console.error("Failed to load presentation ratings:", error);
    }
  }, [user.email]);

  const processedData = useMemo(() => {
    const allRatedItems: RatedItem[] = [];
    const demographicBreakdown: Record<Demographic, { Easy: number, Medium: number, Hard: number, total: number }> = {
        'Neonate': { Easy: 0, Medium: 0, Hard: 0, total: 0 },
        'Pediatrics': { Easy: 0, Medium: 0, Hard: 0, total: 0 },
        'Adult': { Easy: 0, Medium: 0, Hard: 0, total: 0 },
        'Geriatrics': { Easy: 0, Medium: 0, Hard: 0, total: 0 },
        'Obstetrics': { Easy: 0, Medium: 0, Hard: 0, total: 0 },
    };

    for (const demographic in progress) {
        for (const presentationName in progress[demographic as Demographic]) {
            for (const category in progress[demographic as Demographic][presentationName]) {
                const difficulty = progress[demographic as Demographic][presentationName][category];
                allRatedItems.push({
                    demographic: demographic as Demographic,
                    presentationName,
                    category: category as VindicateCategory,
                    difficulty,
                });
                demographicBreakdown[demographic as Demographic][difficulty]++;
                demographicBreakdown[demographic as Demographic].total++;
            }
        }
    }

    const uniquePresentations = new Set(allRatedItems.map(item => item.presentationName));

    const totalReviewed = uniquePresentations.size;
    const easyCount = allRatedItems.filter(i => i.difficulty === 'Easy').length;
    const mediumCount = allRatedItems.filter(i => i.difficulty === 'Medium').length;
    const hardCount = allRatedItems.filter(i => i.difficulty === 'Hard').length;
    
    const hardItems = allRatedItems.filter(i => i.difficulty === 'Hard').sort((a,b) => a.presentationName.localeCompare(b.presentationName));
    const easyItems = allRatedItems.filter(i => i.difficulty === 'Easy').sort((a,b) => a.presentationName.localeCompare(b.presentationName));
    
    const maxTotal = Math.max(...Object.values(demographicBreakdown).map(d => d.total));

    return {
        totalReviewed,
        easyCount,
        mediumCount,
        hardCount,
        demographicBreakdown,
        maxTotal: maxTotal === 0 ? 1 : maxTotal,
        hardItems,
        easyItems,
        hasData: allRatedItems.length > 0
    };
  }, [progress]);


  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-start mb-6">
        <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Home</button>
      </div>
      <h2 className="text-3xl font-bold text-center mb-8 text-stone-800 dark:text-stone-200">My Review Progress</h2>

    {!processedData.hasData ? (
         <div className="text-center py-20 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-inner">
            <CheckmarkIcon className="w-16 h-16 mx-auto mb-4 text-stone-400 dark:text-stone-500" />
            <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-2">No Progress to Show Yet</h3>
        </div>
    ) : (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reviewed" value={processedData.totalReviewed} colorClass="bg-orange-500 text-orange-50" icon={<ChecklistIcon className="w-6 h-6" />} />
                <StatCard title="Strengths" value={processedData.easyCount} colorClass="bg-green-500 text-green-50" icon={<CheckmarkIcon className="w-6 h-6" />} />
                <StatCard title="Areas for Growth" value={processedData.mediumCount} colorClass="bg-yellow-500 text-yellow-50" icon={<MagnifyingGlassIcon className="w-6 h-6" />} />
                <StatCard title="Focus Areas" value={processedData.hardCount} colorClass="bg-red-500 text-red-50" icon={<BrainIcon className="w-6 h-6" />} />
            </div>

            {/* Bar Chart */}
            <div className="bg-stone-100 dark:bg-stone-800 p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-4 text-center">Difficulty Breakdown by Population</h3>
                <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 px-2 sm:px-4">
                    {Object.keys(processedData.demographicBreakdown).map(demographic => (
                        <span key={demographic} className="flex-1 text-center font-semibold">{demographic.substring(0,4)}.</span>
                    ))}
                </div>
                <div className="flex items-end justify-between h-48 sm:h-64 space-x-2 sm:space-x-4 pt-2">
                    {Object.entries(processedData.demographicBreakdown).map(([demographic, data]) => {
                        // FIX: Add type assertion for `data` as its type is inferred as `unknown` by `Object.entries`.
                        const typedData = data as { Easy: number; Medium: number; Hard: number; total: number; };
                        const barHeight = (typedData.total / processedData.maxTotal) * 100;
                        const totalForSegments = typedData.total || 1;
                        const easyHeight = (typedData.Easy / totalForSegments) * 100;
                        const mediumHeight = (typedData.Medium / totalForSegments) * 100;
                        const hardHeight = (typedData.Hard / totalForSegments) * 100;

                        return (
                            <div key={demographic} className="flex-1 flex flex-col h-full justify-end group relative" title={`${demographic} - Total: ${typedData.total}`}>
                                <div className="bg-stone-200 dark:bg-stone-700 rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300" style={{ height: `${barHeight}%` }}>
                                    <div className="bg-red-500" style={{ height: `${hardHeight}%` }}></div>
                                    <div className="bg-yellow-500" style={{ height: `${mediumHeight}%` }}></div>
                                    <div className="bg-green-500" style={{ height: `${easyHeight}%` }}></div>
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-stone-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                    Hard: {typedData.Hard}<br/>
                                    Medium: {typedData.Medium}<br/>
                                    Easy: {typedData.Easy}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-stone-800"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500"></span>Easy</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-500"></span>Medium</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500"></span>Hard</div>
                </div>
            </div>
            
            {/* Detailed Lists */}
            <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3 p-2 bg-red-500/10 rounded-md">
                            <div className="w-3 h-6 rounded-sm bg-red-500"></div>
                            <h4 className="font-semibold text-red-600 dark:text-red-400">Focus Areas ({processedData.hardItems.length})</h4>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {processedData.hardItems.length > 0 ? processedData.hardItems.map((item, index) => (
                                <button key={index} onClick={() => onSelectReviewItem(item.demographic, item.presentationName, item.category)}
                                    className="w-full text-left p-3 bg-stone-200 dark:bg-stone-700/60 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">{item.presentationName}</p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{item.demographic} - {item.category}</p>
                                </button>
                            )) : <div className="text-sm text-center text-stone-500 dark:text-stone-400 p-4 bg-stone-100 dark:bg-stone-800 rounded-md">No items rated as hard yet. Keep studying!</div>}
                        </div>
                    </div>
                    <div>
                         <div className="flex items-center gap-3 mb-3 p-2 bg-green-500/10 rounded-md">
                            <div className="w-3 h-6 rounded-sm bg-green-500"></div>
                            <h4 className="font-semibold text-green-600 dark:text-green-400">Strengths ({processedData.easyItems.length})</h4>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {processedData.easyItems.length > 0 ? processedData.easyItems.map((item, index) => (
                                <button key={index} onClick={() => onSelectReviewItem(item.demographic, item.presentationName, item.category)}
                                    className="w-full text-left p-3 bg-stone-200 dark:bg-stone-700/60 rounded-md hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">{item.presentationName}</p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{item.demographic} - {item.category}</p>
                                </button>
                            )) : <div className="text-sm text-center text-stone-500 dark:text-stone-400 p-4 bg-stone-100 dark:bg-stone-800 rounded-md">No items rated as easy yet.</div>}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )}

    </div>
  );
};

export default ReviewProgressScreen;