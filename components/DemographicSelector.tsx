import React from 'react';
import { Demographic } from '../types';

interface DemographicSelectorProps {
  onSelect: (demographic: Demographic) => void;
  onBack: () => void;
}

const DEMOGRAPHICS: { name: Demographic; description: string }[] = [
    { name: 'Neonate', description: 'Birth to 28 days' },
    { name: 'Pediatrics', description: '28 days to 18 years' },
    { name: 'Adult', description: '18 to 65 years' },
    { name: 'Geriatrics', description: '65+ years' },
    { name: 'Obstetrics', description: 'Pregnancy & Birth' },
];

const DemographicSelector: React.FC<DemographicSelectorProps> = ({ onSelect, onBack }) => {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex justify-start mb-6 max-w-6xl mx-auto">
        <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Home</button>
      </div>
      <h2 className="text-2xl font-bold text-center mb-8 text-stone-700 dark:text-stone-300">Select Patient Population</h2>
      
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
        {DEMOGRAPHICS.map((demographic) => (
          <div 
            key={demographic.name}
            className="bg-stone-100 dark:bg-stone-800 py-4 px-6 rounded-lg shadow-lg flex flex-row items-center justify-between transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-72"
          >
            <div className="text-left">
                <h3 className="text-xl font-semibold text-stone-800 dark:text-white">{demographic.name}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{demographic.description}</p>
            </div>
            <button
              onClick={() => onSelect(demographic.name)}
              aria-label={`Select ${demographic.name}`}
              className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-orange-600 text-white hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-800 focus:ring-orange-500 ml-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemographicSelector;