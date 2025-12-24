
import React, { useState } from 'react';
import { Presentation, Differential } from '../types';
import { VINDICATE_CATEGORIES } from '../constants';

interface LearningModeProps {
  presentation: Presentation;
}

// A new sub-component for the flashcard
const DifferentialFlashcard: React.FC<{ differential: Differential }> = ({ differential }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    // Outer container to set the 3D perspective
    <div className="perspective-1000 h-full">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-full min-h-[240px] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''} ${differential.isCritical ? 'animate-pulse-border rounded-lg' : ''}`}
        aria-live="polite"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsFlipped(!isFlipped); }}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden bg-stone-200 dark:bg-stone-800 p-4 rounded-lg shadow-md flex items-center justify-center">
          <h4 className="font-bold text-center text-stone-900 dark:text-white text-xl">{differential.name}</h4>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-stone-300 dark:bg-stone-700 p-6 rounded-lg shadow-md flex flex-col justify-center text-base overflow-y-auto">
           <p className="text-stone-700 dark:text-stone-300 text-center">{differential.pathophysiology}</p>
        </div>
      </div>
    </div>
  );
};


const LearningMode: React.FC<LearningModeProps> = ({ presentation }) => {
  if (!presentation.differentials || presentation.differentials.length === 0) {
    return (
        <div className="text-center py-10 text-stone-500 dark:text-stone-400 p-4">
            <p>No differential diagnoses generated for the selected criteria.</p>
            <p>Try adjusting the filters.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {Object.values(VINDICATE_CATEGORIES).map(catInfo => {
        const differentials = presentation.differentials.filter(d => d.category === catInfo.name);
        if (differentials.length === 0) return null;

        return (
          <div key={catInfo.name}>
            <div className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-6 rounded-sm ${catInfo.color}`}></span>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">{catInfo.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
              {differentials.map(d => (
                <DifferentialFlashcard key={d.name} differential={d} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LearningMode;