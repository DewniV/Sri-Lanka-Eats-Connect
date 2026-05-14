'use client';

import { Search, Lightbulb, Calendar } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Search',
      description: 'Use AI-powered search to find restaurants by cuisine, location, or your preferences.',
    },
    {
      icon: Lightbulb,
      title: 'Discover',
      description: 'Explore detailed menus, reviews, ratings, and personalised recommendations.',
    },
    {
      icon: Calendar,
      title: 'Reserve',
      description: 'Book your table instantly with real-time availability and confirmations.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f2419 0%, #0a1a10 100%)' }}>
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#d4af37' }}>Simple Steps</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #d4af37)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e8' }}>
            How It Works
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a89060' }}>
            Simple steps to discover and book your favourite restaurants in Sri Lanka.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index}
                className="glass-card relative rounded-2xl p-7 group hover:scale-[1.02] transition-all duration-300"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                {/* Step number watermark */}
                <div className="absolute top-4 right-5 text-6xl font-black select-none"
                  style={{ color: 'rgba(212,175,55,0.08)' }}>
                  {index + 1}
                </div>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors"
                  style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <Icon className="w-6 h-6" style={{ color: '#d4af37' }} />
                </div>
                {/* Step badge */}
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#d4af37' }}>
                  Step {index + 1}
                </div>
                {/* Title */}
                <h3 className="text-xl font-bold mb-2" style={{ color: '#f5f0e8' }}>
                  {step.title}
                </h3>
                {/* Description */}
                <p className="text-sm leading-relaxed" style={{ color: '#a89060' }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
