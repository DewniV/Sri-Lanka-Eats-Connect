'use client';

import { Search, MapPin, Star, MessageCircle } from 'lucide-react';
import { AnimatedText } from './animated-text';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero-bg relative pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Extra decorative orbs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.3), transparent)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4), transparent)', filter: 'blur(30px)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            {/* Language pill */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.35)', color: '#d4af37' }}>
              <span>🇱🇰</span>
              <span>English · සිංහල · தமிழ்</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e8' }}>
              Discover Sri Lanka&apos;s
              <span className="block gold-text">Finest Restaurants</span>
            </h1>

            <AnimatedText />

            {/* Search Bar */}
            <div className="flex gap-2 max-w-lg mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#d4af37' }} />
                <input
                  type="text"
                  placeholder="Search cuisine, city, or restaurant..."
                  className="w-full pl-11 pr-4 py-4 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: '#f5f0e8',
                    backdropFilter: 'blur(10px)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.8)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.3)'}
                />
              </div>
              <Link
                href="/restaurants"
                className="btn-gold px-6 py-4 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap text-sm"
              >
                Search
              </Link>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/restaurants" className="btn-gold px-6 py-3 rounded-xl font-semibold text-sm">
                Explore Restaurants
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(212,175,55,0.4)', color: '#d4af37' }}
              >
                Join as Vendor
              </Link>
            </div>
          </div>

          {/* Right: Stats cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, value: 'All Sri Lanka', label: 'Cities Covered', glow: 'rgba(212,175,55,0.15)' },
              { icon: Star, value: '4.8 avg', label: 'Restaurant Rating', glow: 'rgba(212,175,55,0.12)' },
              { icon: MessageCircle, value: 'EN · සි · த', label: 'AI Chatbot Languages', glow: 'rgba(100,200,120,0.1)' },
              { icon: Search, value: '10+', label: 'Restaurants Listed', glow: 'rgba(100,150,255,0.1)' },
            ].map(({ icon: Icon, value, label, glow }) => (
              <div key={label}
                className="glass-card rounded-2xl p-5 hover:scale-105 transition-all duration-300 cursor-default"
                style={{ boxShadow: `0 8px 32px ${glow}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <Icon size={20} style={{ color: '#d4af37' }} />
                </div>
                <div className="text-xl font-bold" style={{ color: '#f5f0e8' }}>{value}</div>
                <div className="text-sm" style={{ color: '#a89060' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
