'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchFilterProps {
  onSearch: (filters: {
    query: string;
    cuisine: string;
    city: string;
  }) => void;
}

export function SearchFilterBar({ onSearch }: SearchFilterProps) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [city, setCity] = useState('All');

  const handleSearch = () => {
    onSearch({ query, cuisine, city });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6">Find Restaurants</h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Text Search Input */}
          <input
            type="text"
            placeholder="Search restaurants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />

          {/* Cuisine Dropdown */}
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-foreground"
          >
            <option value="All">All Cuisines</option>
            <option value="Rice & Curry">Rice & Curry</option>
            <option value="Seafood">Seafood</option>
            <option value="Chinese">Chinese</option>
            <option value="Indian">Indian</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Desserts">Desserts</option>
            <option value="Sri Lankan">Sri Lankan</option>
            <option value="Fusion">Fusion</option>
          </select>

          {/* City Dropdown */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-foreground"
          >
            <option value="All">All Cities</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
            <option value="Galle">Galle</option>
            <option value="Negombo">Negombo</option>
            <option value="Jaffna">Jaffna</option>
          </select>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
