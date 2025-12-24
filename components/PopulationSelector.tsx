
import React from 'react';

interface SystemSelectorProps {
  onSelect: (system: string) => void;
  systems: string[];
}

const SystemSelector: React.FC<SystemSelectorProps> = ({ onSelect, systems }) => {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-stone-600 dark:text-stone-300">Select Organ System</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {systems.map((system) => (
          <button
            key={system}
            onClick={() => onSelect(system)}
            className="bg-stone-100 dark:bg-stone-800 p-6 rounded-lg shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:ring-2 hover:ring-orange-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <p className="text-lg font-semibold text-stone-800 dark:text-white">{system}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SystemSelector;