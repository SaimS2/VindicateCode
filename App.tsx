
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PresentationList from './components/PresentationList';
import CaseView from './components/CaseView';
import HomeScreen from './components/HomeScreen';
import { AppProvider } from './contexts/AppContext';
import { Presentation, User, UserStats, Differential, Demographic, Difficulty, VindicateCategory } from './types';
import { SYSTEMS, PRESENTATIONS_BY_SYSTEM } from './constants';
import Footer from './components/Footer';
import AboutScreen from './components/AboutScreen';
import LoginScreen from './components/LoginScreen';
import SavedScenariosScreen from './components/SavedScenariosScreen';
import DemographicSelector from './components/DemographicSelector';
import ReviewProgressScreen from './components/ReviewProgressScreen';
import PresentationSelectionMethod from './components/PresentationSelectionMethod';
import ReviewScreen from './components/ReviewScreen';
import ReviewDifficultySelector from './components/ReviewDifficultySelector';

type ViewState = 'home' | 'demographic' | 'presentationMethod' | 'presentation' | 'case' | 'about' | 'savedScenarios' | 'reviewProgress' | 'review' | 'reviewDifficultySelect';
type PresentationListMode = 'search' | 'index';

const DEFAULT_STATS: UserStats = {
  lastLogin: Date.now(),
  streak: 1,
  differentialsLearned: [],
  scenariosCompleted: 0,
  timeSpentSeconds: 0,
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoginScreenOpen, setLoginScreenOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [selectedDemographic, setSelectedDemographic] = useState<Demographic | null>(null);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [presentationListMode, setPresentationListMode] = useState<PresentationListMode>('search');
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [initialVindicateCategory, setInitialVindicateCategory] = useState<VindicateCategory | null>(null);

  const [selectedReviewDifficulty, setSelectedReviewDifficulty] = useState<Difficulty | null>(null);

  // Stats Management
  useEffect(() => {
    if (user) {
      try {
        const storedStats = localStorage.getItem(`userStats-${user.email}`);
        if (storedStats) {
          const stats: UserStats = JSON.parse(storedStats);
          
          // Check streak
          const today = new Date();
          const lastLoginDate = new Date(stats.lastLogin);
          const isSameDay = today.toDateString() === lastLoginDate.toDateString();

          if (!isSameDay) {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const wasYesterday = yesterday.toDateString() === lastLoginDate.toDateString();
            stats.streak = wasYesterday ? stats.streak + 1 : 1;
            stats.lastLogin = Date.now();
          }
          setUserStats(stats);
        } else {
          setUserStats(DEFAULT_STATS);
        }
      } catch (e) {
        console.error("Failed to parse user stats, resetting.", e);
        setUserStats(DEFAULT_STATS);
      }
    } else {
      setUserStats(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && userStats) {
      localStorage.setItem(`userStats-${user.email}`, JSON.stringify(userStats));
    }
  }, [user, userStats]);

  // Time tracking
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        setUserStats(prev => prev ? { ...prev, timeSpentSeconds: prev.timeSpentSeconds + 1 } : null);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleDifferentialsLearned = useCallback((differentials: Differential[]) => {
    setUserStats(prev => {
      if (!prev) return null;
      const newLearned = new Set([...prev.differentialsLearned, ...differentials.map(d => d.name)]);
      return { ...prev, differentialsLearned: Array.from(newLearned) };
    });
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setLoginScreenOpen(false);
  };
  const handleLogout = () => {
    setUser(null);
  };

  const handleSelectMode = (view: 'presentation' | 'about') => {
    if (view === 'presentation') {
      setCurrentView('demographic');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectDemographic = (demographic: Demographic) => {
    setSelectedDemographic(demographic);
    setCurrentView('presentationMethod');
  };

  const handleSearchSubmit = (term: string) => {
    setPresentationListMode('search');
    setInitialSearchTerm(term);
    setCurrentView('presentation');
  };

  const handleSelectPresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setInitialSearchTerm(''); // Clear search term when moving to case view
    setInitialVindicateCategory(null);
    setCurrentView('case');
  };

  const handleRandomPresentation = (difficulty?: Difficulty) => {
    if (!selectedDemographic) return;

    // Fallback for non-logged-in users or if demographic is not set
    if (!user || !difficulty) {
        const allPresentations = Object.values(PRESENTATIONS_BY_SYSTEM).flat();
        const randomPresentation = allPresentations[Math.floor(Math.random() * allPresentations.length)];
        setSelectedPresentation(randomPresentation);
        setInitialVindicateCategory(null);
        setCurrentView('case');
        return;
    }

    // Difficulty-based random selection
    try {
        const key = `presentationRatings-${user.email}`;
        const storedRatingsRaw = localStorage.getItem(key);
        const storedRatings: Record<string, Record<string, Record<string, Difficulty>>> = storedRatingsRaw ? JSON.parse(storedRatingsRaw) : {};
        
        const demographicRatings = storedRatings[selectedDemographic];
        if (!demographicRatings) {
            alert(`You haven't rated any presentations as "${difficulty}" for the ${selectedDemographic} population yet.`);
            return;
        }

        const matchingPresentations: { presentation: Presentation; category: VindicateCategory }[] = [];
        const allPresentationsFlat = Object.values(PRESENTATIONS_BY_SYSTEM).flat();
        const presentationsMap = new Map(allPresentationsFlat.map(p => [p.name, p]));

        Object.entries(demographicRatings).forEach(([presentationName, categoryRatings]) => {
            const presentation = presentationsMap.get(presentationName);
            if (!presentation) return;

            const ratedCategories = Object.entries(categoryRatings);

            if (difficulty === 'Hard') {
                const hardCats = ratedCategories.filter(([, d]) => d === 'Hard').map(([cat]) => cat as VindicateCategory);
                hardCats.forEach(cat => matchingPresentations.push({ presentation, category: cat }));
            } else if (difficulty === 'Medium') {
                const hasHard = ratedCategories.some(([, d]) => d === 'Hard');
                if (hasHard) return;
                const mediumCats = ratedCategories.filter(([, d]) => d === 'Medium').map(([cat]) => cat as VindicateCategory);
                mediumCats.forEach(cat => matchingPresentations.push({ presentation, category: cat }));
            } else if (difficulty === 'Easy') {
                const hasHardOrMedium = ratedCategories.some(([, d]) => d === 'Hard' || d === 'Medium');
                if (hasHardOrMedium) return;
                const easyCats = ratedCategories.filter(([, d]) => d === 'Easy').map(([cat]) => cat as VindicateCategory);
                easyCats.forEach(cat => matchingPresentations.push({ presentation, category: cat }));
            }
        });

        if (matchingPresentations.length === 0) {
            alert(`No presentations found with a rating of "${difficulty}" for the ${selectedDemographic} population.`);
            return;
        }

        const randomChoice = matchingPresentations[Math.floor(Math.random() * matchingPresentations.length)];
        setSelectedPresentation(randomChoice.presentation);
        setInitialVindicateCategory(randomChoice.category);
        setCurrentView('case');

    } catch (e) {
        console.error("Error finding rated presentation:", e);
        alert("An error occurred while trying to find a rated presentation.");
    }
  };
  
  const goHome = () => {
    setCurrentView('home');
    setSelectedPresentation(null);
    setSelectedDemographic(null);
  };
  
  const handleShowHistory = () => setCurrentView('savedScenarios');
  const handleShowReviewProgress = () => setCurrentView('reviewProgress');

  const backToDemographicSelector = () => {
    setCurrentView('demographic');
    setSelectedDemographic(null);
  };

  const backToPresentationMethodSelector = () => {
    setCurrentView('presentationMethod');
    setInitialSearchTerm('');
    setSelectedPresentation(null);
    setInitialVindicateCategory(null);
    setSelectedReviewDifficulty(null);
  };

  const handleSelectReviewItem = (demographic: Demographic, presentationName: string, category: VindicateCategory) => {
    const allPresentationsFlat = Object.values(PRESENTATIONS_BY_SYSTEM).flat();
    const presentation = allPresentationsFlat.find(p => p.name === presentationName);
    if (presentation) {
        setSelectedDemographic(demographic);
        setSelectedPresentation(presentation);
        setInitialVindicateCategory(category);
        setCurrentView('case');
    } else {
        console.error(`Presentation not found: ${presentationName}`);
        alert(`Could not find the presentation "${presentationName}". It may have been removed.`);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeScreen onSelectMode={handleSelectMode} />;
      case 'about':
        return <AboutScreen onBack={goHome} />;
      case 'reviewDifficultySelect':
        return <ReviewDifficultySelector 
                    user={user}
                    onBack={backToPresentationMethodSelector} 
                    onSelectDifficulty={(difficulty) => {
                        setSelectedReviewDifficulty(difficulty);
                        setCurrentView('review');
                    }}
                />;
       case 'review':
        if (!user || !selectedReviewDifficulty) {
            backToPresentationMethodSelector();
            return null;
        }
        return <ReviewScreen 
                  user={user} 
                  difficulty={selectedReviewDifficulty}
                  onBack={() => {
                      setSelectedReviewDifficulty(null);
                      setCurrentView('reviewDifficultySelect');
                  }} 
                  onSelectReviewItem={handleSelectReviewItem} 
                />;
      case 'demographic':
        return <DemographicSelector 
                  onSelect={handleSelectDemographic} 
                  onBack={goHome} 
                />;
      case 'presentationMethod':
        return <PresentationSelectionMethod
                  user={user}
                  onBack={backToDemographicSelector}
                  onSearchSubmit={handleSearchSubmit}
                  onSelectIndex={() => {
                    setPresentationListMode('index');
                    setInitialSearchTerm('');
                    setCurrentView('presentation');
                  }}
                  onSelectRandom={handleRandomPresentation}
                  presentationsBySystem={PRESENTATIONS_BY_SYSTEM}
                  onSelectPresentation={handleSelectPresentation}
                  onSelectReview={() => setCurrentView('reviewDifficultySelect')}
               />;
      case 'presentation':
        return <PresentationList 
                  presentationsBySystem={PRESENTATIONS_BY_SYSTEM} 
                  onSelect={handleSelectPresentation} 
                  onBack={backToPresentationMethodSelector}
                  onSelectRandom={() => handleRandomPresentation()}
                  user={user}
                  mode={presentationListMode}
                  initialSearchTerm={initialSearchTerm}
                />;
      case 'savedScenarios':
        if (!user) {
            goHome();
            return null;
        }
        return <SavedScenariosScreen user={user} onBack={goHome} />;
      case 'reviewProgress':
        if (!user) {
          goHome();
          return null;
        }
        return <ReviewProgressScreen user={user} onBack={goHome} onSelectReviewItem={handleSelectReviewItem} />;
      case 'case':
        if (!selectedPresentation || !selectedDemographic) return null;
        return <CaseView 
                  user={user}
                  presentationName={selectedPresentation.name} 
                  demographic={selectedDemographic}
                  onBack={backToPresentationMethodSelector} 
                  onDifferentialsLearned={handleDifferentialsLearned}
                  initialCategory={initialVindicateCategory}
                />;
      default:
        return <HomeScreen onSelectMode={handleSelectMode} />;
    }
  };

  return (
    <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Header onHomeClick={goHome} onLogout={handleLogout} user={user} stats={userStats} onShowHistory={handleShowHistory} onShowReviewProgress={handleShowReviewProgress} onLoginClick={() => setLoginScreenOpen(true)}/>
            <main className="flex-grow">
                {renderContent()}
            </main>
            <Footer />
          </div>
          <LoginScreen isOpen={isLoginScreenOpen} onLogin={handleLogin} onClose={() => setLoginScreenOpen(false)} />
    </AppProvider>
  );
}

export default App;
