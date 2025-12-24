

import React from 'react';
import { Difficulty, User } from '../types';

interface ReviewDifficultySelectorProps {
    user: User | null;
    onBack: () => void;
    onSelectDifficulty: (difficulty: Difficulty) => void;
}

const DifficultyButton: React.FC<{
    difficulty: Difficulty;
    onClick: () => void;
    colorClasses: string;
}> = ({ difficulty, onClick, colorClasses }) => (
    <button
        onClick={onClick}
        className={`w-full p-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-900 ${colorClasses}`}
    >
        <h3 className="text-3xl font-bold text-white">{difficulty}</h3>
    </button>
);

const ReviewDifficultySelector: React.FC<ReviewDifficultySelectorProps> = ({ user, onBack, onSelectDifficulty }) => {
    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-2xl mx-auto">
            <div className="flex justify-start mb-6 w-full">
                <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Selection Method</button>
            </div>
            <h2 className="text-2xl font-bold text-center mb-8 text-stone-700 dark:text-stone-300">Select Difficulty to Review</h2>
            
            {user ? (
                <div className="space-y-6">
                    <DifficultyButton 
                        difficulty="Hard" 
                        onClick={() => onSelectDifficulty('Hard')} 
                        colorClasses="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                    />
                    <DifficultyButton 
                        difficulty="Medium" 
                        onClick={() => onSelectDifficulty('Medium')} 
                        colorClasses="bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
                    />
                    <DifficultyButton 
                        difficulty="Easy" 
                        onClick={() => onSelectDifficulty('Easy')} 
                        colorClasses="bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    />
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-stone-100 dark:bg-stone-800 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-2">Login Required</h3>
                    <p className="text-stone-600 dark:text-stone-400">You must be logged in to review the content that is marked.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewDifficultySelector;