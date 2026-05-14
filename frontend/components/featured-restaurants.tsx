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
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1a10 0%, #0f2419 100%)' }}>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4af37' }}>Top Picks</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e8' }}>
              Featured Restaurants
            </h2>
            <p className="mt-2" style={{ color: '#a89060' }}>
              Handpicked top-rated restaurants across Sri Lanka.
            </p>
          </div>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 font-semibold text-sm hover:gap-3 transition-all"
            style={{ color: '#d4af37' }}
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
              className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.15)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.8) 0%, transparent 60%)' }} />
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(212,175,55,0.9)', color: '#0f2419' }}>
                    {restaurant.cuisine}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4">
                <h3 className="text-base font-bold mb-1 line-clamp-1 transition-colors"
                  style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', serif" }}>
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1 text-xs mb-3" style={{ color: '#a89060' }}>
                  <MapPin className="w-3 h-3" style={{ color: '#d4af37' }} />
                  <span>{restaurant.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold" style={{ color: '#f5f0e8' }}>{restaurant.rating}</span>
                  <span className="text-xs" style={{ color: '#a89060' }}>({restaurant.reviews} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
