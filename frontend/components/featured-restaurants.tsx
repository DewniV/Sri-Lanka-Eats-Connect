'use client';

import { Star, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function FeaturedRestaurants() {
  const restaurants = [
    {
      id: 1,
      name: 'Lakshmi Restaurant',
      cuisine: 'Sri Lankan',
      location: 'Colombo 7',
      rating: 4.8,
      reviews: 324,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      name: 'The Spice Route',
      cuisine: 'Indian & Asian Fusion',
      location: 'Mount Lavinia',
      rating: 4.6,
      reviews: 256,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      name: "Ocean's Bounty",
      cuisine: 'Seafood',
      location: 'Negombo',
      rating: 4.7,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      name: 'Colonial Kitchen',
      cuisine: 'Modern Sri Lankan',
      location: 'Kandy',
      rating: 4.9,
      reviews: 412,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Top Picks</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Featured Restaurants
            </h2>
            <p className="text-muted-foreground mt-2">
              Handpicked top-rated restaurants across Sri Lanka.
            </p>
          </div>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all"
          >
            View all restaurants <ArrowRight size={16} />
          </Link>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href="/restaurants"
              className="group block bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs font-semibold">
                    {restaurant.cuisine}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{restaurant.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{restaurant.rating}</span>
                  <span className="text-xs text-muted-foreground">({restaurant.reviews} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
