import React from 'react';

interface ConfidenceSliderProps {
  confidence: number;
  setConfidence: (value: number) => void;
}

const ConfidenceSlider: React.FC<ConfidenceSliderProps> = ({ confidence, setConfidence }) => {
  const getSliderColor = () => {
    if (confidence < 33) return 'accent-red-500';
    if (confidence < 66) return 'accent-yellow-500';
    return 'accent-green-500';
  };

  return (
    <div className="w-full my-4">
      <label htmlFor="confidence" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        How confident are you? ({confidence}%)
      </label>
      <input
        id="confidence"
        type="range"
        min="0"
        max="100"
        value={confidence}
        onChange={(e) => setConfidence(parseInt(e.target.value, 10))}
        className={`w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer ${getSliderColor()}`}
      />
    </div>
  );
};

export default ConfidenceSlider;