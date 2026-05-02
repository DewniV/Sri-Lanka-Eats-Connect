'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
              SE
            </div>
            <span>SL Eats Connect</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            AI-powered restaurant discovery for Sri Lanka.
          </p>
          <div className="border-t border-border w-full pt-6 mt-2">
            <p className="text-sm text-muted-foreground text-center">
              &copy; {currentYear} SL Eats Connect. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
