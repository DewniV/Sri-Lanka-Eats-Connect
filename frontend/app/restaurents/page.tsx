'use client';

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { RestaurantCard } from '@/components/restaurant-card';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  rating: number;
  reviews: number;
  priceRange: string;
  isOpen: boolean;
  image: string;
}

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Ministry of Crab',
    cuisine: 'Seafood',
    city: 'Colombo',
    rating: 4.8,
    reviews: 256,
    priceRange: '$$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Nuga Gama',
    cuisine: 'Sri Lankan',
    city: 'Colombo',
    rating: 4.6,
    reviews: 189,
    priceRange: '$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Palmyrah Restaurant',
    cuisine: 'Jaffna Cuisine',
    city: 'Colombo',
    rating: 4.5,
    reviews: 142,
    priceRange: '$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'The Gallery Café',
    cuisine: 'Fusion',
    city: 'Colombo',
    rating: 4.7,
    reviews: 203,
    priceRange: '$$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1514432324607-2e467f4af445?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: 'Hotel de Pilawoos',
    cuisine: 'Sri Lankan',
    city: 'Colombo',
    rating: 4.4,
    reviews: 167,
    priceRange: '$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4d71bcdd2d59?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: 'Saffron',
    cuisine: 'Indian',
    city: 'Kandy',
    rating: 4.3,
    reviews: 128,
    priceRange: '$$',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e4e67?w=400&h=300&fit=crop'
  }
];

export default function RestaurantsPage() {
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

  const handleSearch = (filters: {
    query: string;
    cuisine: string;
    city: string;
  }) => {
    let results = restaurants;

    // Filter by text search
    if (filters.query) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(filters.query.toLowerCase())
      );
    }

    // Filter by cuisine
    if (filters.cuisine !== 'All') {
      results = results.filter(r => r.cuisine === filters.cuisine);
    }

    // Filter by city
    if (filters.city !== 'All') {
      results = results.filter(r => r.city === filters.city);
    }

    setFilteredRestaurants(results);
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        <SearchFilterBar onSearch={handleSearch} />

        {/* Restaurant Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredRestaurants.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">
                Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    name={restaurant.name}
                    cuisine={restaurant.cuisine}
                    city={restaurant.city}
                    rating={restaurant.rating}
                    reviews={restaurant.reviews}
                    priceRange={restaurant.priceRange}
                    isOpen={restaurant.isOpen}
                    image={restaurant.image}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No restaurants found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
