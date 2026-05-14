'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is SL Eats Connect free to use?',
    a: 'Yes! Browsing restaurants, reading menus, and using Nila (our AI assistant) are completely free. Creating an account is also free and gives you access to table reservations and your Eats Points balance.',
  },
  {
    q: 'How do I make a reservation?',
    a: "Find a restaurant you love, open its detail page, choose your date, time, and party size, then click \"Reserve a Table\". You'll receive a confirmation immediately. You can view all your upcoming reservations in your profile.",
  },
  {
    q: 'What are Eats Points?',
    a: 'Eats Points are our loyalty rewards. You earn 100 points every time you complete a reservation at a partner restaurant. Once you collect 500 points, you can redeem them for a dining discount at your next visit.',
  },
  {
    q: 'Can I cancel or modify a reservation?',
    a: 'Yes. Go to your Profile, find the booking under Reservations, and click "Cancel". We recommend cancelling at least 2 hours before your reservation time as a courtesy to the restaurant.',
  },
  {
    q: 'How does the AI chatbot (Nila) work?',
    a: 'Nila searches our restaurant database in real time based on your request — cuisine, location, budget, or occasion — and suggests the best matches. She can also walk you through making a reservation step by step, all in English, Sinhala, or Tamil.',
  },
  {
    q: 'Does Nila only know about restaurants in the database?',
    a: "Yes. Nila only recommends restaurants that are listed and verified on SL Eats Connect. This ensures every suggestion is accurate and up to date. If your favourite spot isn't listed yet, ask the owner to register as a vendor.",
  },
  {
    q: 'How do I list my restaurant on SL Eats Connect?',
    a: "Click \"Join as Vendor\" on the homepage or go to /register and select the Vendor option. After creating your account you'll have access to the Vendor Dashboard where you can add your restaurant details, menu, photos, and manage reservations.",
  },
  {
    q: 'Is the platform available in Sinhala and Tamil?',
    a: 'The Nila chatbot supports English, Sinhala, and Tamil. You can switch languages using the flag button inside the chat window. Full website localisation is on our roadmap.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0f2419 0%, #0a1a10 100%)' }}>
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4af37' }}>Got Questions?</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #d4af37)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#f5f0e8' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-lg" style={{ color: '#a89060' }}>
            Everything you need to know about SL Eats Connect.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: openIndex === i ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)',
                border: openIndex === i ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(212,175,55,0.12)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
              >
                <span className="font-semibold text-sm sm:text-base"
                  style={{ color: openIndex === i ? '#d4af37' : '#f5f0e8' }}>
                  {faq.q}
                </span>
                <span className={`ml-4 flex-shrink-0 text-xl font-light transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`}
                  style={{ color: openIndex === i ? '#d4af37' : '#6b5a3e' }}>
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed pt-2"
                  style={{ color: '#a89060', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
