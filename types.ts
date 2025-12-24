

export type AppMode = 'learning' | 'clinical';
// FIX: Add missing AppTheme type.
export type AppTheme = 'light' | 'dark';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Chronicity = 
  | '1 minute – 1 hour'
  | '1 hour – 1 day'
  | '1 day – 7 days'
  | '7 days – 2 weeks'
  | '>2 weeks – 6 weeks'
  | '>6 weeks – 3 months'
  | '>3 months – 6 months'
  | '>6 months';

export type BiologicalSex = 'Male' | 'Female';
export type Demographic = 'Neonate' | 'Pediatrics' | 'Adult' | 'Geriatrics' | 'Obstetrics';

export interface PresentationFilters {
  chronicity: Chronicity;
  sex: BiologicalSex;
  age: number;
}

export enum VindicateCategory {
  Vascular = 'Vascular',
  Infectious = 'Infectious',
  Neoplastic = 'Neoplastic',
  Degenerative = 'Degenerative',
  Iatrogenic = 'Iatrogenic/Intoxication',
  Congeneric = 'Congeneric',
  Autoimmune = 'Autoimmune',
  Traumatic = 'Traumatic',
  Endocrine = 'Endocrine',
}

export interface Differential {
  name: string;
  category: VindicateCategory;
  pathophysiology: string;
  signsAndSymptoms: string[];
  patientHistory: string[];
  physicalExamSigns: string[];
  labs: string[];
  imaging: string[];
  treatmentOptions: string[];
  validation: 'Medical Student' | 'Resident' | 'Physician';
  isCritical?: boolean;
}

export interface Presentation {
  name: string;
  differentials: Differential[];
  resources: { name: string; url: string }[];
}

export interface MCQ {
  id?: string;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: string;
  rationale: string;
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
}

export interface User {
  name: string;
  email: string;
  pictureUrl?: string;
}

export interface UserStats {
  lastLogin: number; // timestamp
  streak: number;
  differentialsLearned: string[]; // store names to count unique
  scenariosCompleted: number;
  timeSpentSeconds: number;
}

export interface FlashcardSettings {
  againMinutes: number;
  goodDays: number;
  easyDays: number;
  newCardsPerDay: number;
}

export interface CardProgress {
  reviewDate: number; // timestamp
  intervalDays: number;
  easeFactor: number;
}