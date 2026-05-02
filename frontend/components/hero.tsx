'use client';

import { Search, MapPin, Star, MessageCircle } from 'lucide-react';
import { AnimatedText } from './animated-text';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/60 rounded-full blur-2xl -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            {/* Language pill */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-primary/20">
              <span>🇱🇰</span>
              <span>English · සිංහල · தமிழ்</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4">
              Discover Sri Lanka's
              <span className="block text-primary">Finest Restaurants</span>
            </h1>

            <AnimatedText />

            {/* Search Bar */}
            <div className="flex gap-2 max-w-lg mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search cuisine, city, or restaurant..."
                  className="w-full pl-11 pr-4 py-4 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                />
              </div>
              <Link
                href="/restaurants"
                className="px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shadow-sm"
              >
                Search
              </Link>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/restaurants"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                Explore Restaurants
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-white text-foreground border border-border rounded-xl font-semibold hover:bg-muted/50 transition-colors shadow-sm"
              >
                Join as Vendor
              </Link>
            </div>
          </div>

          {/* Right: Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, value: 'All Sri Lanka', label: 'Cities Covered', color: 'bg-orange-50 text-primary' },
              { icon: Star, value: '4.8 avg', label: 'Restaurant Rating', color: 'bg-amber-50 text-amber-600' },
              { icon: MessageCircle, value: 'EN · සි · த', label: 'AI Chatbot Languages', color: 'bg-green-50 text-green-600' },
              { icon: Search, value: '10+', label: 'Restaurants Listed', color: 'bg-blue-50 text-blue-600' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <div className="text-xl font-bold text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
