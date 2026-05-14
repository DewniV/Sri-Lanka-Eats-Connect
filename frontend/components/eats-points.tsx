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
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1a10 0%, #0f2419 50%, #1a2e0a 100%)' }}>
      {/* Gold glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)', filter: 'blur(20px)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4af37' }}>Loyalty Programme</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #d4af37)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e8' }}>
            Earn Eats Points Every Visit
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a89060' }}>
            Book a table, earn 100 points. Collect 500 points and unlock real dining rewards at your favourite Sri Lankan restaurants.
          </p>
        </div>

        {/* How it works — 3 steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
          {STEPS.map((item) => (
            <div key={item.step}
              className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="text-5xl font-bold mb-3 gold-text">{item.step}</div>
              <h3 className="font-bold mb-2" style={{ color: '#f5f0e8' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#a89060' }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl p-6 text-center transition-all duration-300 hover:scale-[1.02]"
              style={tier.highlight ? {
                background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                color: '#0f2419',
                boxShadow: '0 12px 40px rgba(212,175,55,0.4)',
                transform: 'scale(1.05)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: tier.highlight ? 'rgba(15,36,25,0.7)' : '#a89060' }}>
                {tier.range}
              </div>
              <h3 className="text-xl font-bold mb-3"
                style={{ color: tier.highlight ? '#0f2419' : '#f5f0e8', fontFamily: "'Playfair Display', serif" }}>
                {tier.name}
              </h3>
              <p className="text-sm leading-relaxed"
                style={{ color: tier.highlight ? 'rgba(15,36,25,0.85)' : '#a89060' }}>
                {tier.perks}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/register" className="btn-gold inline-block px-8 py-3 rounded-xl font-semibold text-sm">
            Start Earning Points
          </Link>
        </div>
      </div>
    </section>
  );
}
