import React from 'react';
import { Plane, Wallet, CalendarDays, MapPin } from 'lucide-react';

interface TripInsightsProps {
  days: number;
  budgetTier: 'Budget' | 'Standard' | 'Luxury';
  locationsCount: number;
}

export const TripInsights: React.FC<TripInsightsProps> = ({ days, budgetTier, locationsCount }) => {
  // Simple heuristic calculations 
  const baseCost = budgetTier === 'Budget' ? 50 : budgetTier === 'Standard' ? 150 : 400;
  const estimatedTotalCost = days * baseCost;
  const avgDistanceCovered = days * 45; // arbitrary static metric for "Insights"

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
        <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{days} Days</p>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
        <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg text-green-600 dark:text-green-400">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Est. Budget</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">${estimatedTotalCost}</p>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
        <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg text-amber-600 dark:text-amber-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Places</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{locationsCount} Stops</p>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
        <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-lg text-purple-600 dark:text-purple-400">
          <Plane className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Est. Distance</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">~{avgDistanceCovered} km</p>
        </div>
      </div>
    </div>
  );
};

export default TripInsights;
