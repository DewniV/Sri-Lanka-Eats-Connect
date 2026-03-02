'use client';

import { Star, MapPin } from 'lucide-react';

export function FeaturedRestaurants() {
  const restaurants = [
    {
      id: 1,
      name: 'Lakshmi Restaurant',
      cuisine: 'Sri Lankan',
      location: 'Colombo 7',
      rating: 4.8,
      reviews: 324,
    },
    {
      id: 2,
      name: 'The Spice Route',
      cuisine: 'Indian & Asian Fusion',
      location: 'Mount Lavinia',
      rating: 4.6,
      reviews: 256,
    },
    {
      id: 3,
      name: 'Ocean\'s Bounty',
      cuisine: 'Seafood',
      location: 'Negombo',
      rating: 4.7,
      reviews: 189,
    },
    {
      id: 4,
      name: 'Colonial Kitchen',
      cuisine: 'Modern Sri Lankan',
      location: 'Kandy',
      rating: 4.9,
      reviews: 412,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Featured Restaurants
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Explore our handpicked selection of top-rated restaurants across Sri Lanka.
          </p>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
            >
              {/* Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/15 group-hover:to-primary/10 transition-colors" />

              {/* Card Content */}
              <div className="p-5">
                {/* Restaurant Name */}
                <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                  {restaurant.name}
                </h3>

                {/* Cuisine Type */}
                <p className="text-sm text-muted-foreground mb-3">
                  {restaurant.cuisine}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.location}</span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(restaurant.rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {restaurant.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({restaurant.reviews})
                  </span>
                </div>

                {/* View Menu Button */}
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                  View Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
