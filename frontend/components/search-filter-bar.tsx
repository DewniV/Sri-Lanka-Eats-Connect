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

const inputStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: '#f5f0e8',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
  outline: 'none',
  width: '100%',
  fontSize: '0.95rem',
};

const selectStyle = {
  background: '#0f2419',
  border: '1px solid rgba(212,175,55,0.3)',
  color: '#f5f0e8',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
  outline: 'none',
  cursor: 'pointer',
  fontSize: '0.95rem',
};

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
    <div style={{ background: 'linear-gradient(180deg, #0a1a10 0%, #0f2419 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', serif" }}>
          Find Restaurants
        </h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Text Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#d4af37' }} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.8)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
            />
          </div>

          {/* Cuisine Dropdown */}
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            style={selectStyle}
          >
            <option value="All">All Cuisines</option>
            <option value="Rice & Curry">Rice &amp; Curry</option>
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
            style={selectStyle}
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
            className="btn-gold px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 whitespace-nowrap text-sm"
          >
            <Search size={18} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
