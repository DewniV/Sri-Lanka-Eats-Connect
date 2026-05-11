'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, LogOut, ChevronDown, UtensilsCrossed, Menu, X, Heart, ShieldCheck } from 'lucide-react';

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export function Navigation() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sl_eats_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('sl_eats_user');
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sl_eats_user');
    localStorage.removeItem('sl_eats_token');
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  // Safe initial — never crashes even if name is undefined
  const userInitial = (user?.name || '?').charAt(0).toUpperCase();

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-border z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold">
              SE
            </div>
            <span className="text-foreground">SL Eats Connect</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/restaurants', 'Restaurants']].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium transition-colors ${
                  pathname === href ? 'text-primary font-semibold' : 'text-foreground hover:text-primary'
                }`}
              >
                {label}
              </Link>
            ))}
            {user?.role === 'vendor' && (
              <Link href="/vendor/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link href="/favourites" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Favourites
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-primary font-semibold hover:opacity-80 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Logged in — show user avatar + dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                    {userInitial}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-border w-52 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <User size={15} className="text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <UtensilsCrossed size={15} className="text-gray-400" />
                        My Reservations
                      </Link>
                      {user.role === 'customer' && (
                        <Link
                          href="/favourites"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                        >
                          <Heart size={15} className="text-gray-400" />
                          My Favourites
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-gray-50 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-primary" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out — show Login and Register */
              <>
                <Link
                  href="/login"
                  className="text-foreground hover:text-primary transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-2">
          {[['/', 'Home'], ['/restaurants', 'Restaurants']].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </Link>
          ))}
          {user?.role === 'vendor' && (
            <Link href="/vendor/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted">
              Dashboard
            </Link>
          )}
          {user?.role === 'customer' && (
            <Link href="/favourites" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted">
              Favourites
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-muted">
              Admin Dashboard
            </Link>
          )}
          {!user && (
            <div className="pt-2 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
