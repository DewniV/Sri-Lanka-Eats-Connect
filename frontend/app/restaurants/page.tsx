'use client';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { RestaurantCard } from '@/components/restaurant-card';

export const dynamic = 'force-dynamic';

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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  // Fetch all restaurants from backend on page load
  useEffect(() => {
    fetchRestaurants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRestaurants = async (filters?: { query: string; cuisine: string; city: string }) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters?.query) params.append('search', filters.query);
      if (filters?.cuisine && filters.cuisine !== 'All') params.append('cuisine', filters.cuisine);
      if (filters?.city && filters.city !== 'All') params.append('city', filters.city);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch restaurants');

      const data = await response.json();

      // Backend returns either a plain array OR { restaurants: [...], total: N }
      // Handle both formats safely
      const list: Restaurant[] = Array.isArray(data) ? data : (data.restaurants || []);

      setRestaurants(list);
      setFilteredRestaurants(list);
    } catch (err) {
      setError('Could not load restaurants. Please make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: { query: string; cuisine: string; city: string }) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    fetchRestaurants(filters);
  };

  // Suppress unused variable warning for activeFilters
  void activeFilters;

  // Pagination helpers
  const totalPages = Math.ceil(filteredRestaurants.length / PAGE_SIZE);
  const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                {totalPages > 1 && ` — Page ${currentPage} of ${totalPages}`}
              </p>

              {paginatedRestaurants.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedRestaurants.map(restaurant => (
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

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        ← Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                            page === currentPage
                              ? 'bg-primary text-primary-foreground shadow'
                              : 'border border-border hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
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
