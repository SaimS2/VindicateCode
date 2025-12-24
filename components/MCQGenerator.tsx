

import React, { useState, useCallback, useEffect } from 'react';
import { MCQ, PresentationFilters, Difficulty, User, Demographic } from '../types';
import { generateMCQScenario } from '../services/geminiService';

interface MCQGeneratorProps {
  presentationName: string;
  filters: PresentationFilters;
  demographic: Demographic;
  onScenarioCompleted: () => void;
  user: User | null;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const MCQGenerator: React.FC<MCQGeneratorProps> = ({ presentationName, filters, demographic, onScenarioCompleted, user }) => {
  const [mcq, setMcq] = useState<MCQ | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!mcq || !user) {
      setIsSaved(false);
      return;
    }
    try {
      const key = `savedScenarios-${user.email}`;
      const savedScenariosRaw = localStorage.getItem(key);
      const savedScenarios: MCQ[] = savedScenariosRaw ? JSON.parse(savedScenariosRaw) : [];
      const alreadyExists = savedScenarios.some(s => s.scenario === mcq.scenario);
      setIsSaved(alreadyExists);
    } catch (e) {
      setIsSaved(false);
    }
  }, [mcq, user]);

  const handleGenerate = useCallback(async () => {
    if (!selectedDifficulty) return;

    setLoading(true);
    setError(null);
    setMcq(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setIsSaved(false);
    try {
      const generatedMcq = await generateMCQScenario(presentationName, filters, selectedDifficulty, demographic);
      if (generatedMcq) {
        setMcq(generatedMcq);
      } else {
        setError('Failed to generate a valid MCQ. Please try again.');
      }
    } catch (e) {
      setError('An error occurred while communicating with the AI.');
    } finally {
      setLoading(false);
    }
  }, [presentationName, filters, selectedDifficulty, demographic]);

  const handleSubmitAnswer = () => {
      if (selectedAnswer) {
          setShowAnswer(true);
          onScenarioCompleted();
      }
  };

  const handleSaveScenario = () => {
    if (!mcq || !user) return;
    try {
      const key = `savedScenarios-${user.email}`;
      const savedScenariosRaw = localStorage.getItem(key);
      const savedScenarios: MCQ[] = savedScenariosRaw ? JSON.parse(savedScenariosRaw) : [];

      const alreadyExists = savedScenarios.some(s => s.scenario === mcq.scenario);
      if (alreadyExists) {
        setIsSaved(true);
        return;
      }
      
      const scenarioToSave: MCQ = { ...mcq, id: Date.now().toString() };
      savedScenarios.unshift(scenarioToSave); // Add to the beginning of the list
      localStorage.setItem(key, JSON.stringify(savedScenarios));
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save scenario:", error);
    }
  };

  const handleSelectDifficulty = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setMcq(null);
    setError(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const getOptionClass = (option: string) => {
    if (!showAnswer) {
      return selectedAnswer === option ? 'bg-orange-600 dark:bg-orange-700 ring-2 ring-orange-500' : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600';
    }
    if (option === mcq?.correctAnswer) {
      return 'bg-green-600 dark:bg-green-700 ring-2 ring-green-400';
    }
    if (option === selectedAnswer && option !== mcq?.correctAnswer) {
      return 'bg-red-600 dark:bg-red-700 ring-2 ring-red-400';
    }
    return 'bg-stone-200 dark:bg-stone-700 text-stone-500';
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h4 className="font-semibold text-center text-stone-700 dark:text-stone-300 mb-3">Choose a Difficulty</h4>
        <div className="flex justify-center gap-4">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => handleSelectDifficulty(d)}
              className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-100 dark:focus:ring-offset-stone-800 focus:ring-indigo-500 ${
                selectedDifficulty === d 
                  ? 'bg-indigo-600 text-white transform scale-105 shadow-lg' 
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading || !selectedDifficulty}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962_0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating {selectedDifficulty} Scenario...
          </>
        ) : `Generate ${selectedDifficulty ? selectedDifficulty : ''} AI Scenario for ${presentationName}`}
      </button>

      {error && <p className="mt-4 text-center text-red-500 dark:text-red-400">{error}</p>}

      {mcq && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg">
            <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Scenario:</h4>
            <p className="text-stone-800 dark:text-stone-300 whitespace-pre-wrap">{mcq.scenario}</p>
          </div>
          <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg">
            <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">{mcq.question}</h4>
            <div className="space-y-2 text-stone-800 dark:text-stone-200">
              {mcq.options.map((option, index) => (
                <button
                  key={index}
                  disabled={showAnswer}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full text-left p-3 rounded-md transition-all duration-200 ${getOptionClass(option)}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {!showAnswer && (
             <div className="flex items-center gap-4">
                <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1 bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-700 disabled:bg-orange-800 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
                >
                    Submit Answer
                </button>
                <button
                    onClick={handleSaveScenario}
                    disabled={isSaved || !user}
                    title={!user ? "You must be logged in to save scenarios" : isSaved ? "Scenario is saved" : "Save scenario for later review"}
                    className="flex-1 bg-stone-500 text-white font-bold py-2 px-4 rounded-md hover:bg-stone-600 disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaved ? 'Saved' : 'Save Scenario'}
                </button>
            </div>
          )}

          {showAnswer && (
            <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg animate-fade-in">
              <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Rationale:</h4>
              <p className="text-stone-800 dark:text-stone-300">{mcq.rationale}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MCQGenerator;