import React, { useState } from 'react';
import { FlashcardSettings } from '../types';

interface FlashcardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FlashcardSettings;
  onSave: (newSettings: FlashcardSettings) => void;
}

const FlashcardSettingsModal: React.FC<FlashcardSettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-4">Flashcard Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="againMinutes" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              "Again" Interval (minutes)
            </label>
            <input
              type="number"
              id="againMinutes"
              name="againMinutes"
              value={currentSettings.againMinutes}
              onChange={handleInputChange}
              className="mt-1 w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
             <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">When you get a card wrong, it will reappear after this many minutes.</p>
          </div>
          <div>
            <label htmlFor="goodDays" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              "Good" Interval for New Cards (days)
            </label>
            <input
              type="number"
              id="goodDays"
              name="goodDays"
              value={currentSettings.goodDays}
              onChange={handleInputChange}
              className="mt-1 w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
             <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">The first time you answer "Good" on a new card.</p>
          </div>
          <div>
            <label htmlFor="easyDays" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              "Easy" Interval for New Cards (days)
            </label>
            <input
              type="number"
              id="easyDays"
              name="easyDays"
              value={currentSettings.easyDays}
              onChange={handleInputChange}
              className="mt-1 w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">The first time you answer "Easy" on a new card.</p>
          </div>
           <div>
            <label htmlFor="newCardsPerDay" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              New Cards Per Day
            </label>
            <input
              type="number"
              id="newCardsPerDay"
              name="newCardsPerDay"
              value={currentSettings.newCardsPerDay}
              onChange={handleInputChange}
              className="mt-1 w-full bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Maximum number of new cards to introduce each day.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md font-semibold bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardSettingsModal;