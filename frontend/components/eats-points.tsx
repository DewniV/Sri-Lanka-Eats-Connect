'use client';
import Link from 'next/link';
import { Star, Gift, Trophy, ArrowRight } from 'lucide-react';

const TIERS = [
  {
    icon: Star,
    name: 'Foodie',
    range: '0 – 499 pts',
    perks: 'Access to exclusive restaurant offers',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: Trophy,
    name: 'Regular',
    range: '500 – 1,499 pts',
    perks: 'Priority reservations + 5% dining discount',
    color: 'text-primary',
    bg: 'bg-primary/10',
    highlight: true,
  },
  {
    icon: Gift,
    name: 'VIP',
    range: '1,500+ pts',
    perks: 'Free dessert + 10% discount + early access',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
];

export function EatsPoints() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Loyalty Programme</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Earn Eats Points Every Visit
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Book a table, earn 100 points. Collect 500 points and unlock real dining rewards at your favourite Sri Lankan restaurants.
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {[
            { step: '01', title: 'Reserve a Table', desc: 'Book at any partner restaurant through SL Eats Connect.' },
            { step: '02', title: 'Earn 100 Points', desc: 'Points are credited to your account after each completed visit.' },
            { step: '03', title: 'Redeem Rewards', desc: 'Use 500 points for a discount or unlock exclusive VIP perks.' },
          ].map(item => (
            <div key={item.step} className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="text-4xl font-black text-primary/10 mb-3">{item.step}</div>
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {TIERS.map(tier => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 border transition-all duration-200 ${
                  tier.highlight
                    ? 'border-primary shadow-md bg-white ring-2 ring-primary/20'
                    : 'border-border bg-white'
                }`}
              >
                {tier.highlight && (
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 bg-primary/10 px-2 py-1 rounded-full inline-block">
                    Most Popular
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${tier.bg} flex items-center justify-center mb-4`}>
                  <Icon size={22} className={tier.color} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{tier.name}</h3>
                <p className="text-xs text-muted-foreground font-semibold mb-3">{tier.range}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tier.perks}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Start Earning Points <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">Free to join · No credit card required</p>
        </div>
      </div>
    </section>
  );
}
