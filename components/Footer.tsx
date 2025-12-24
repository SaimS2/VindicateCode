

import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

const Footer: React.FC = () => {
  const { appMode } = useContext(AppContext);

  const learningText = "Designed to prepare you for major medical licensing and clinical exams, including the USMLE, MCCQE Parts I & II, NBME Shelf Exams, and OSCEs.";
  const clinicalText = "Designed to strengthen your clinical reasoning and diagnostic decision-making for real-world practice: from OSCEs and clerkship rotations, residency training, to full-time practice.";

  return (
    <footer className="text-center p-4 bg-stone-200 dark:bg-stone-800 text-xs text-stone-500 dark:text-stone-400">
      <p className="hidden md:block">{appMode === 'learning' ? learningText : clinicalText}</p>
    </footer>
  );
};

export default Footer;