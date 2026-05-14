'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: '#050f08', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0f2419' }}>
              SL
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', serif" }}>SL Eats Connect</div>
              <div className="text-xs tracking-widest uppercase" style={{ color: '#d4af37' }}>Sri Lanka&apos;s Finest</div>
            </div>
          </div>

          <p className="text-sm text-center max-w-sm" style={{ color: '#6b5a3e' }}>
            AI-powered restaurant discovery for Sri Lanka — in English, සිංහල, and தமிழ்.
          </p>

          <div className="w-full pt-6 mt-2" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
            <p className="text-sm text-center" style={{ color: '#4a3a28' }}>
              &copy; {currentYear} SL Eats Connect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
