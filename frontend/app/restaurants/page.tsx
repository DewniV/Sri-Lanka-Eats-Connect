'use client';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { RestaurantCard } from '@/components/restaurant-card';

interface Restaurant {
  _id: string;
  name: string;
  cuisineType: string;
  city: string;
  averageRating: number;
  totalReviews: number;
  priceRange: string;
  coverImage: string;
  isActive: boolean;
  description: string;
  address: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState({ query: '', cuisine: 'All', city: 'All' });

  // Fetch all restaurants from backend on page load
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async (filters?: { query: string; cuisine: string; city: string }) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters?.query) params.append('search', filters.query);
      if (filters?.cuisine && filters.cuisine !== 'All') params.append('cuisine', filters.cuisine);
      if (filters?.city && filters.city !== 'All') params.append('city', filters.city);

      const url = `http://localhost:5000/api/restaurants${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch restaurants');

      const data = await response.json();
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (err) {
      setError('Could not load restaurants. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: { query: string; cuisine: string; city: string }) => {
    setActiveFilters(filters);
    fetchRestaurants(filters);
  };

  // Map priceRange from DB values to display symbols
  const getPriceDisplay = (priceRange: string) => {
    const map: Record<string, string> = {
      budget: '$',
      mid: '$$',
      upscale: '$$$',
      fine: '$$$$'
    };
    return map[priceRange] || '$$';
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        <SearchFilterBar onSearch={handleSearch} />

        {/* Restaurant Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-4 text-muted-foreground">Loading restaurants...</span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-lg text-red-500">{error}</p>
              <button
                onClick={() => fetchRestaurants()}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
              </p>

              {filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map(restaurant => (
                    <RestaurantCard
                      key={restaurant._id}
                      id={restaurant._id}
                      name={restaurant.name}
                      cuisine={restaurant.cuisineType}
                      city={restaurant.city}
                      rating={restaurant.averageRating}
                      reviews={restaurant.totalReviews}
                      priceRange={getPriceDisplay(restaurant.priceRange)}
                      isOpen={restaurant.isActive}
                      image={restaurant.coverImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">No restaurants found matching your criteria.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
