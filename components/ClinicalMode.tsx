

import React from 'react';
import { Presentation } from '../types';
import { VINDICATE_CATEGORIES } from '../constants';

interface ClinicalModeProps {
  presentation: Presentation;
}

const ClinicalMode: React.FC<ClinicalModeProps> = ({ presentation }) => {
  return (
    <div className="space-y-6 p-4">
      {Object.values(VINDICATE_CATEGORIES).map(catInfo => {
        const differentials = presentation.differentials.filter(d => d.category === catInfo.name);
        if (differentials.length === 0) return null;

        return (
          <div key={catInfo.name}>
            <div className="flex items-center gap-3 mb-3">
                <span className={`w-3 h-6 rounded-sm ${catInfo.color}`}></span>
                <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">{catInfo.name}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {differentials.map(d => (
                <div 
                  key={d.name} 
                  className={`bg-stone-200 dark:bg-stone-800 p-3 rounded-lg shadow-md flex flex-col ${d.isCritical ? 'border-2 border-red-500' : 'border-2 border-transparent'}`}
                >
                  <h4 className="font-bold text-lg text-stone-900 dark:text-white mb-2">{d.name}</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 flex-grow">{d.pathophysiology}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
       {presentation.differentials.length === 0 && (
          <div className="text-center py-10 text-stone-500 dark:text-stone-400">
              <p>No differential diagnoses generated for the selected criteria.</p>
              <p>Try adjusting the filters.</p>
          </div>
      )}
    </div>
  );
};

export default ClinicalMode;