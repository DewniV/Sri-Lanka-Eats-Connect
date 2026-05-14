'use client';
import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { RestaurantCard } from '@/components/restaurant-card';
import { Search } from 'lucide-react';

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

  void activeFilters;

  const totalPages = Math.ceil(filteredRestaurants.length / PAGE_SIZE);
  const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPriceDisplay = (priceRange: string) => {
    const map: Record<string, string> = { budget: '$', mid: '$$', upscale: '$$$', fine: '$$$$' };
    return map[priceRange] || '$$';
  };

  return (
    <main className="min-h-screen" style={{ background: '#0a1a10' }}>
      <Navigation />

      {/* Hero Banner */}
      <div className="pt-16">
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #0f2419 60%, #2d1810 100%)', minHeight: '220px' }}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #d4af37, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #d4af37, transparent)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#d4af37' }}>Discover Sri Lanka</span>
              <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #d4af37)' }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#f5f0e8' }}>
              Find Your Perfect Dining Experience
            </h1>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#a89060' }}>
              From beachfront seafood in Galle to rooftop dining in Colombo — discover Sri Lanka&apos;s finest restaurants
            </p>
          </div>
        </div>

        {/* Search bar sits just below hero */}
        <div style={{ background: '#0a1a10' }}>
          <SearchFilterBar onSearch={handleSearch} />
        </div>

        {/* Restaurant Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ background: '#0a1a10' }}>

          {loading && (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
              <span className="text-sm font-medium" style={{ color: '#6b5a3e' }}>Loading restaurants...</span>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
                <Search size={24} style={{ color: '#ef4444' }} />
              </div>
              <p className="text-lg font-medium text-red-600 mb-4">{error}</p>
              <button onClick={() => fetchRestaurants()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-medium" style={{ color: '#a89060' }}>
                  <span className="font-bold text-base" style={{ color: '#d4af37' }}>{filteredRestaurants.length}</span> restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                  {totalPages > 1 && <span style={{ color: '#a89060' }}> — Page {currentPage} of {totalPages}</span>}
                </p>
              </div>

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

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                      <button
                        onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#1a3a2a', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
                        ← Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
                          style={page === currentPage
                            ? { background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a', boxShadow: '0 2px 8px rgba(212,175,55,0.4)' }
                            : { background: 'rgba(255,255,255,0.07)', color: '#f5f0e8', border: '1px solid rgba(212,175,55,0.2)' }}>
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#1a3a2a', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}>
                        Next →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <Search size={32} style={{ color: '#d4af37' }} />
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: '#f5f0e8' }}>No restaurants found</p>
                  <p className="text-sm" style={{ color: '#a89060' }}>Try adjusting your search or filters.</p>
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
