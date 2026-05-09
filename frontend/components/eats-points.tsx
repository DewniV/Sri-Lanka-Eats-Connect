'use client';

import Link from 'next/link';

const STEPS = [
  { step: '01', title: 'Reserve a Table', desc: 'Book at any partner restaurant through SL Eats Connect.' },
  { step: '02', title: 'Earn 100 Points', desc: 'Points are credited to your account after each completed visit.' },
  { step: '03', title: 'Redeem Rewards', desc: 'Use 500 points for a discount or unlock exclusive VIP perks.' },
];

const TIERS = [
  {
    name: 'Foodie',
    range: '0 – 499 pts',
    perks: 'Access to exclusive restaurant offers',
    highlight: false,
  },
  {
    name: 'Regular',
    range: '500 – 1,499 pts',
    perks: 'Priority reservations + 5% dining discount',
    highlight: true,
  },
  {
    name: 'VIP',
    range: '1,500+ pts',
    perks: 'Free dessert + 10% discount + early access',
    highlight: false,
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
          {STEPS.map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-6 border border-border shadow-sm text-center">
              <div className="text-4xl font-bold text-primary/10 mb-3">{item.step}</div>
              <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 border text-center transition-shadow ${
                tier.highlight
                  ? 'bg-primary text-white border-primary shadow-lg scale-105'
                  : 'bg-white border-border text-foreground'
              }`}
            >
              <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${tier.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                {tier.range}
              </div>
              <h3 className={`text-xl font-bold mb-3 ${tier.highlight ? 'text-white' : 'text-foreground'}`}>
                {tier.name}
              </h3>
              <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-white/90' : 'text-muted-foreground'}`}>
                {tier.perks}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Earning Points
          </Link>
        </div>
      </div>
    </section>
  );
}
