'use client';

import { Search } from 'lucide-react';
import { AnimatedText } from './animated-text';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
          Discover Sri Lanka's Finest Restaurants
        </h1>

        {/* Subheading with Animated Multilingual Text */}
        <AnimatedText />

        {/* Search Bar */}
        <div className="flex gap-3 mb-12 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search by cuisine, location, or restaurant name..."
            className="flex-1 px-6 py-4 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap">
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Decorative Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-sm">
          <div>
            <div className="font-bold text-foreground text-lg">500+</div>
            <div className="text-muted-foreground">Restaurants</div>
          </div>
          <div>
            <div className="font-bold text-foreground text-lg">10K+</div>
            <div className="text-muted-foreground">Reviews</div>
          </div>
          <div>
            <div className="font-bold text-foreground text-lg">AI</div>
            <div className="text-muted-foreground">Powered</div>
          </div>
        </div>
      </div>
    </section>
  );
}
