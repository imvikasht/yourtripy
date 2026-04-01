import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface PackingListProps {
  destination: string;
  days: number;
}

export const PackingList: React.FC<PackingListProps> = ({ destination, days }) => {
  const generateList = () => {
    const baseItems = ['Toothbrush', 'Phone Charger', 'Power Bank', `Underwear x${days}`, `Socks x${days}`];
    const destLower = destination.toLowerCase();

    let specificItems: string[] = [];

    if (destLower.includes('beach') || destLower.includes('goa') || destLower.includes('miami') || destLower.includes('maldives') || destLower.includes('island')) {
      specificItems = ['Sunscreen', 'Swimwear', 'Sunglasses', 'Flip-flops', 'Beach Towel'];
    } else if (destLower.includes('mountain') || destLower.includes('snow') || destLower.includes('himalaya') || destLower.includes('alps') || destLower.includes('manali')) {
      specificItems = ['Thermal Wear', 'Trekking Shoes', 'Heavy Jacket', 'Gloves', 'Beanie'];
    } else {
      specificItems = ['Comfortable Walking Shoes', 'Umbrella', 'Casual Outfits', 'Light Jacket'];
    }

    return [...baseItems, ...specificItems];
  };

  const items = generateList();

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        <BadgeCheck className="w-5 h-5 mr-2 text-indigo-500" />
        Smart Packing List
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackingList;
