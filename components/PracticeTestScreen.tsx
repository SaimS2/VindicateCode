

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MCQ } from '../types';
import { generatePracticeTest } from '../services/geminiService';

type TestStatus = 'intro' | 'generating' | 'active' | 'results';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const PracticeTestScreen: React.FC<{ onBack: () => void, onTestCompleted: (count: number) => void }> = ({ onBack, onTestCompleted }) => {
    const [status, setStatus] = useState<TestStatus>('intro');
    const [questions, setQuestions] = useState<MCQ[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

    useEffect(() => {
        if (status !== 'active') return;
        if (timeLeft <= 0) {
            onTestCompleted(answeredCount);
            setStatus('results');
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [status, timeLeft, onTestCompleted, answeredCount]);

    const startTest = useCallback(async (questionCount: number, durationMinutes: number) => {
        setStatus('generating');
        setError(null);
        try {
            const generatedQuestions = await generatePracticeTest(questionCount);
            if (generatedQuestions.length === 0) {
                 throw new Error(`AI failed to generate questions. Please try again.`);
            }
            setQuestions(generatedQuestions);
            setTimeLeft(durationMinutes * 60);
            setAnswers({});
            setCurrentIndex(0);
            setStatus('active');
        } catch (e: any) {
            setError(e.message || 'Failed to generate the practice test. The AI may be busy or an error occurred. Please try again later.');
            setStatus('intro');
        }
    }, []);

    const restartTest = () => {
        setStatus('intro');
        setQuestions([]);
    };

    const handleAnswerSelect = (answer: string) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
    };
    
    const goToNext = () => setCurrentIndex(i => Math.min(i + 1, questions.length - 1));
    const goToPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

    const finishTest = () => {
      if (window.confirm('Are you sure you want to finish the test? Your score will be calculated based on your current answers.')) {
        onTestCompleted(answeredCount);
        setStatus('results');
      }
    };
    
    const score = useMemo(() => {
        if (status !== 'results') return 0;
        return questions.reduce((correctCount, question, index) => {
            if (answers[index] === question.correctAnswer) {
                return correctCount + 1;
            }
            return correctCount;
        }, 0);
    }, [status, questions, answers]);

    if (status === 'intro') {
        return (
            <div className="p-4 md:p-8 animate-fade-in max-w-3xl mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-200 mb-4">MCCQE Part I Practice Test Section</h2>
                 <div className="bg-stone-100 dark:bg-stone-800 p-6 rounded-lg shadow-lg w-full">
                    <p className="text-stone-600 dark:text-stone-300 mb-6">
                        Choose your test format. This simulates the MCCQE Part I exam. Your progress will not be saved if you leave the page.
                    </p>
                    {error && <p className="mb-4 text-center text-red-500 dark:text-red-400">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => startTest(10, 15)} className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex flex-col items-center justify-center">
                            <span className="text-lg">Sample Test</span>
                            <span className="text-sm font-normal">(10 Questions, 15 Mins)</span>
                        </button>
                         <button onClick={() => startTest(115, 160)} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center justify-center">
                            <span className="text-lg">Full-Length Test</span>
                            <span className="text-sm font-normal">(115 Questions, 160 Mins)</span>
                        </button>
                    </div>
                    <button onClick={onBack} className="mt-6 text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)]">
                <svg className="animate-spin h-12 w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-stone-600 dark:text-stone-300 text-lg">Generating your practice test...</p>
                <p className="mt-2 text-stone-500 dark:text-stone-400">This may take a minute or two. Please don't navigate away.</p>
            </div>
        );
    }
    
    if (status === 'results') {
        const percentage = questions.length > 0 ? ((score / questions.length) * 100).toFixed(1) : 0;
        return (
             <div className="p-4 md:p-8 animate-fade-in max-w-3xl mx-auto text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="bg-stone-100 dark:bg-stone-800 p-8 rounded-lg shadow-2xl w-full">
                    <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-200 mb-2">Test Complete!</h2>
                    <p className="text-stone-600 dark:text-stone-400 mb-6">Here is your score:</p>
                    <p className="text-6xl font-bold text-orange-600 dark:text-orange-400">{score} / {questions.length}</p>
                    <p className="text-2xl font-semibold text-stone-700 dark:text-stone-300 mb-8">({percentage}%)</p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button onClick={restartTest} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors">
                            Take New Test
                        </button>
                         <button onClick={onBack} className="bg-stone-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-stone-700 transition-colors">
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (status === 'active' && questions.length > 0) {
        const currentQuestion = questions[currentIndex];
        return (
            <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-88px)]">
                <div className="p-2 md:p-4 bg-stone-200 dark:bg-stone-800 border-b border-stone-300 dark:border-stone-700 flex justify-between items-center text-xs sm:text-sm">
                    <div className="font-mono font-bold text-orange-600 dark:text-orange-400 sm:text-lg">{formatTime(timeLeft)}</div>
                    <div className="text-stone-600 dark:text-stone-300"><span className="font-semibold">Question:</span> {currentIndex + 1} / {questions.length}</div>
                    <div className="text-stone-600 dark:text-stone-300"><span className="font-semibold">Answered:</span> {answeredCount} / {questions.length}</div>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
                    <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg mb-4">
                        <p className="text-stone-800 dark:text-stone-300 whitespace-pre-wrap">{currentQuestion.scenario}</p>
                    </div>
                    <div className="bg-stone-100 dark:bg-stone-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-stone-800 dark:text-stone-200 mb-4">{currentQuestion.question}</h4>
                        <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className={`w-full text-left p-3 rounded-md transition-all duration-200 border-2 ${
                                answers[currentIndex] === option
                                ? 'bg-orange-100 dark:bg-orange-900 border-orange-500 text-orange-800 dark:text-orange-200'
                                : 'bg-stone-200 dark:bg-stone-700 border-transparent hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200'
                            }`}
                            >
                            {option}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-stone-200 dark:bg-stone-800 border-t border-stone-300 dark:border-stone-700 flex justify-between items-center">
                    <button onClick={goToPrev} disabled={currentIndex === 0} className="px-6 py-2 rounded-md font-semibold bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        &larr; Previous
                    </button>
                    <button onClick={finishTest} className="px-6 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
                        Finish Test
                    </button>
                    <button onClick={goToNext} disabled={currentIndex === questions.length - 1} className="px-6 py-2 rounded-md font-semibold bg-stone-300 dark:bg-stone-600 hover:bg-stone-400 dark:hover:bg-stone-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        Next &rarr;
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-stone-500">Loading test...</p>
        </div>
    );
};

export default PracticeTestScreen;