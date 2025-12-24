

import React, { useState, useEffect, useMemo } from 'react';
import { User, Difficulty, Demographic, VindicateCategory } from '../types';

interface ReviewScreenProps {
    user: User;
    difficulty: Difficulty;
    onBack: () => void;
    onSelectReviewItem: (demographic: Demographic, presentationName: string, category: VindicateCategory) => void;
}

type RatedItem = {
    demographic: Demographic;
    presentationName: string;
    category: VindicateCategory;
    difficulty: Difficulty;
};

const ReviewScreen: React.FC<ReviewScreenProps> = ({ user, difficulty, onBack, onSelectReviewItem }) => {
    const [ratedItems, setRatedItems] = useState<RatedItem[]>([]);

    useEffect(() => {
        try {
            const key = `presentationRatings-${user.email}`;
            const storedRatingsRaw = localStorage.getItem(key);
            const storedRatings: Record<string, Record<string, Record<string, Difficulty>>> = storedRatingsRaw ? JSON.parse(storedRatingsRaw) : {};
            
            const items: RatedItem[] = [];
            for (const demographic in storedRatings) {
                for (const presentationName in storedRatings[demographic]) {
                    for (const category in storedRatings[demographic][presentationName]) {
                        items.push({
                            demographic: demographic as Demographic,
                            presentationName,
                            category: category as VindicateCategory,
                            difficulty: storedRatings[demographic][presentationName][category],
                        });
                    }
                }
            }
            setRatedItems(items);
        } catch (error) {
            console.error("Failed to load presentation ratings:", error);
        }
    }, [user.email]);

    const itemsForDifficulty = useMemo(() => {
        return ratedItems.filter(item => item.difficulty === difficulty);
    }, [ratedItems, difficulty]);

    const difficultyStyles: Record<Difficulty, { border: string, text: string, textDark: string }> = {
        'Hard': { border: 'border-red-500', text: 'text-red-600', textDark: 'dark:text-red-400' },
        'Medium': { border: 'border-yellow-500', text: 'text-yellow-600', textDark: 'dark:text-yellow-400' },
        'Easy': { border: 'border-green-500', text: 'text-green-600', textDark: 'dark:text-green-400' },
    };

    const styles = difficultyStyles[difficulty];

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-start mb-6">
                <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Difficulty Selection</button>
            </div>
            <h2 className={`text-3xl font-bold text-center mb-8 ${styles.text} ${styles.textDark}`}>
                Reviewing {difficulty} Items
            </h2>

            {itemsForDifficulty.length === 0 ? (
                <div className="text-center py-20 text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-inner">
                    <h3 className="text-2xl font-bold text-stone-700 dark:text-stone-300 mb-2">No Items Rated as {difficulty}</h3>
                    <p>Go back and select another difficulty, or continue studying to rate more items.</p>
                </div>
            ) : (
                <div className={`bg-stone-100 dark:bg-stone-800 p-4 rounded-lg shadow-md border-l-4 ${styles.border}`}>
                    <div className="space-y-2">
                        {itemsForDifficulty.map((item, index) => (
                            <button
                                key={`${item.presentationName}-${item.category}-${index}`}
                                onClick={() => onSelectReviewItem(item.demographic, item.presentationName, item.category)}
                                className="w-full text-left p-3 bg-stone-200 dark:bg-stone-700 rounded-md hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <p className="font-semibold text-stone-800 dark:text-stone-200">{item.presentationName}</p>
                                <p className="text-sm text-stone-600 dark:text-stone-400">{item.demographic} - VINDICATE: {item.category}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewScreen;