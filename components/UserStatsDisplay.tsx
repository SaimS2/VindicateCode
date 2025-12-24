

import React from 'react';
import { UserStats } from '../types';
import { FireIcon } from './icons/FireIcon';
import { BrainIcon } from './icons/BrainIcon';

interface UserStatsDisplayProps {
  stats: UserStats;
}

const StatItem: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  colorClass: string;
}> = ({ icon, value, label, colorClass }) => (
  <div className="relative group flex items-center gap-2 text-sm">
    <div className={colorClass}>{icon}</div>
    <span className="font-semibold text-stone-700 dark:text-stone-200">{value}</span>
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-stone-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
      {label}
    </div>
  </div>
);

const UserStatsDisplay: React.FC<UserStatsDisplayProps> = ({ stats }) => {
  return (
    <div className="flex items-center gap-4 bg-stone-300 dark:bg-stone-700 px-3 py-1.5 rounded-full">
      <StatItem 
        icon={<FireIcon className="w-4 h-4" />}
        value={stats.streak}
        label="Daily Streak"
        colorClass="text-orange-500"
      />
      <div className="w-px h-4 bg-stone-400 dark:bg-stone-600"></div>
      <StatItem 
        icon={<BrainIcon className="w-4 h-4" />}
        value={stats.differentialsLearned.length}
        label="Differentials Learned"
        colorClass="text-orange-500"
      />
    </div>
  );
};

export default UserStatsDisplay;