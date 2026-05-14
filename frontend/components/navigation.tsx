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

  useEffect(() => {
    const stored = localStorage.getItem('sl_eats_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.removeItem('sl_eats_user'); }
    }
  }, []);

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

  const userInitial = (user?.name || '?').charAt(0).toUpperCase();

  const navLinks = [
    ['/', 'Home'],
    ['/restaurants', 'Restaurants'],
  ];

  return (
    <nav className="fixed top-0 w-full z-50" style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #0f2419 100%)', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>
              SL
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-wide" style={{ color: '#f5f0e8' }}>SL Eats Connect</span>
              <span className="text-xs font-light tracking-widest uppercase" style={{ color: '#d4af37', letterSpacing: '0.15em' }}>Sri Lanka&apos;s Finest</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium transition-all duration-200 px-1 py-1 relative group"
                style={{ color: pathname === href ? '#d4af37' : '#d4c9a8' }}
              >
                {label}
                <span className="absolute bottom-0 left-0 h-0.5 transition-all duration-200 rounded-full"
                  style={{ background: '#d4af37', width: pathname === href ? '100%' : '0%' }} />
              </Link>
            ))}
            {user?.role === 'vendor' && (
              <Link href="/vendor/dashboard" className="text-sm font-medium transition-colors" style={{ color: '#d4c9a8' }}>
                Dashboard
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link href="/favourites" className="text-sm font-medium transition-colors" style={{ color: '#d4c9a8' }}>
                Favourites
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium transition-colors" style={{ color: '#d4af37' }}>
                Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#d4c9a8' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow"
                    style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>
                    {userInitial}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate" style={{ color: '#f5f0e8' }}>
                    {user.name || user.email}
                  </span>
                  <ChevronDown size={14} style={{ color: '#d4af37' }} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 rounded-xl shadow-2xl w-52 overflow-hidden" style={{ background: '#1a3a2a', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                      <p className="text-sm font-semibold truncate" style={{ color: '#f5f0e8' }}>{user.name || 'User'}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#a89060' }}>{user.email}</p>
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37' }}>
                        {user.role}
                      </span>
                    </div>
                    <div className="py-1">
                      {[
                        { href: '/profile', icon: <User size={14} />, label: 'My Profile' },
                        { href: '/profile', icon: <UtensilsCrossed size={14} />, label: 'My Reservations' },
                      ].map(item => (
                        <Link key={item.label} href={item.href} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                          style={{ color: '#d4c9a8' }}>
                          <span style={{ color: '#d4af37' }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      {user.role === 'customer' && (
                        <Link href="/favourites" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                          style={{ color: '#d4c9a8' }}>
                          <Heart size={14} style={{ color: '#d4af37' }} />
                          My Favourites
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                          style={{ color: '#d4af37' }}>
                          <ShieldCheck size={14} style={{ color: '#d4af37' }} />
                          Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-red-900/20"
                        style={{ color: '#f87171' }}>
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  style={{ color: '#d4c9a8', border: '1px solid rgba(212,175,55,0.3)' }}>
                  Login
                </Link>
                <Link href="/register"
                  className="text-sm font-semibold px-5 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 py-4 space-y-1" style={{ background: '#0f2419', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
          {navLinks.map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ color: pathname === href ? '#d4af37' : '#d4c9a8', background: pathname === href ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
              {label}
            </Link>
          ))}
          {user?.role === 'vendor' && (
            <Link href="/vendor/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#d4c9a8' }}>Dashboard</Link>
          )}
          {user?.role === 'customer' && (
            <Link href="/favourites" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#d4c9a8' }}>Favourites</Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium" style={{ color: '#d4af37' }}>Admin Dashboard</Link>
          )}
          {!user && (
            <div className="pt-3 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{ color: '#d4c9a8', border: '1px solid rgba(212,175,55,0.3)' }}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>
                Register
              </Link>
            </div>
          )}
          {user && (
            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mt-2" style={{ color: '#f87171' }}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
