import React, { useState } from 'react';

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const vindicateItems = [
    { letter: 'V', term: 'Vascular', explanation: 'Disorders involving blood vessels or circulation.' },
    { letter: 'I', term: 'Infectious/Inflammatory', explanation: 'Conditions caused by infection or inflammation.' },
    { letter: 'N', term: 'Neoplastic', explanation: 'Diseases resulting from abnormal cell growth or tumors.' },
    { letter: 'D', term: 'Degenerative/Deficiency/Drugs', shortTerm: 'Degenerative', explanation: 'Conditions due to tissue degeneration, nutritional deficiencies, or medication effects.' },
    { letter: 'I', term: 'Idiopathic/Intoxication/Iatrogenic', shortTerm: 'Iatrogenic', explanation: 'Disorders with unknown cause, toxin exposure, or medical intervention origin.' },
    { letter: 'C', term: 'Congenital', explanation: 'Conditions present from birth, structural or genetic in nature.' },
    { letter: 'A', term: 'Autoimmune/Allergic/Anatomic', shortTerm: 'Autoimmune', explanation: 'Disorders due to immune dysfunction, allergies, or anatomical abnormalities.' },
    { letter: 'T', term: 'Traumatic', explanation: 'Injuries caused by external physical forces.' },
    { letter: 'E', term: 'Endocrine/Metabolic', explanation: 'Disorders of hormones or body metabolism.' },
  ];

  const handleFlip = (index: number) => {
    setFlippedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-start mb-6">
        <button onClick={onBack} className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 transition-colors">&larr; Back to Home</button>
      </div>
      <div className="bg-stone-100 dark:bg-stone-800 p-6 md:p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-200 mb-4 text-center">
          About the VINDICATE Framework
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-400 mb-8 text-center max-w-3xl mx-auto">
          VINDICATE is a framework used to generate differential diagnoses by disease category.
        </p>
        <div className="space-y-3">
          {vindicateItems.map((item, index) => (
            <button 
              key={index} 
              onClick={() => handleFlip(index)}
              className="w-full text-left bg-stone-200 dark:bg-stone-700 p-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 hover:bg-stone-300 dark:hover:bg-stone-600"
              aria-expanded={flippedIndices.has(index)}
            >
                <div className="flex items-center min-h-[3rem]">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white dark:text-stone-900 rounded-full flex items-center justify-center font-bold text-2xl mr-4">
                        {item.letter}
                    </div>
                    <div>
                        {flippedIndices.has(index) ? (
                            <p className="text-stone-700 dark:text-stone-300">{item.explanation}</p>
                        ) : (
                            <p className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                                <span className="md:hidden">{item.shortTerm || item.term}</span>
                                <span className="hidden md:inline">{item.term}</span>
                            </p>
                        )}
                    </div>
                </div>
            </button>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-stone-300 dark:border-stone-700">
          <ul className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
            <li>
              Cook CE, Décary S. Higher order thinking about differential diagnosis. <i>Braz J Phys Ther.</i> 2020;24(1):1-7. doi:<a href="https://doi.org/10.1016/j.bjpt.2019.01.010" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline ml-1">10.1016/j.bjpt.2019.01.010</a>
            </li>
            <li>
              Kämmer JE, Schauber SK, Hautz SC, Stroben F, Hautz WE. Differential diagnosis checklists reduce diagnostic error differentially: A randomised experiment. <i>Med Educ.</i> 2021;55(10):1172-1182. doi:<a href="https://doi.org/10.1111/medu.14596" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline ml-1">10.1111/medu.14596</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;