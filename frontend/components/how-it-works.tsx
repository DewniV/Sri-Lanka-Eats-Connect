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
      description: 'Explore detailed menus, reviews, ratings, and personalized recommendations.',
    },
    {
      icon: Calendar,
      title: 'Reserve',
      description: 'Book your table instantly with real-time availability and confirmations.',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Simple steps to discover and book your favorite restaurants in Sri Lanka.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative bg-white rounded-2xl p-7 border border-border shadow-sm hover:shadow-md transition-shadow group">
                {/* Step number watermark */}
                <div className="absolute top-4 right-5 text-6xl font-black text-primary/8 select-none">
                  {index + 1}
                </div>
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {/* Step badge */}
                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Step {index + 1}</div>
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
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
