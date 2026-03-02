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
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group hover:bg-primary/20 transition-colors">
                  <Icon className="w-8 h-8 text-primary" />
                </div>

                {/* Step Number */}
                <div className="text-5xl font-bold text-primary/20 mb-2">
                  {index + 1}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-balance">
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
