'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is SL Eats Connect free to use?',
    a: 'Yes! Browsing restaurants, reading menus, and using Nila (our AI assistant) are completely free. Creating an account is also free and gives you access to table reservations and your Eats Points balance.',
  },
  {
    q: 'How do I make a reservation?',
    a: 'Find a restaurant you love, open its detail page, choose your date, time, and party size, then click "Reserve a Table". You\'ll receive a confirmation immediately. You can view all your upcoming reservations in your profile.',
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
    a: 'Yes. Nila only recommends restaurants that are listed and verified on SL Eats Connect. This ensures every suggestion is accurate and up to date. If your favourite spot isn\'t listed yet, ask the owner to register as a vendor.',
  },
  {
    q: 'How do I list my restaurant on SL Eats Connect?',
    a: 'Click "Join as Vendor" on the homepage or go to /register and select the Vendor option. After creating your account you\'ll have access to the Vendor Dashboard where you can add your restaurant details, menu, photos, and manage reservations.',
  },
  {
    q: 'Is the platform available in Sinhala and Tamil?',
    a: 'The Nila chatbot supports English, Sinhala, and Tamil. You can switch languages using the flag button inside the chat window. Full website localisation is on our roadmap.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Got Questions?</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about SL Eats Connect.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/40 transition-colors"
              >
                <span className={`font-semibold text-sm sm:text-base ${openIndex === i ? 'text-primary' : 'text-foreground'}`}>
                  {faq.q}
                </span>
                <span className={`ml-4 flex-shrink-0 text-xl font-light transition-transform duration-200 ${openIndex === i ? 'rotate-45 text-primary' : 'text-muted-foreground'}`}>
                  +
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
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
