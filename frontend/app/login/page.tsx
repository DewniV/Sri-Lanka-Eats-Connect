'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const existing = localStorage.getItem('sl_eats_user');
    if (existing) { router.push('/'); return; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('sl_eats_user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role }));
      localStorage.setItem('sl_eats_token', data.token);
      if (data.role === 'vendor') router.push('/vendor/dashboard');
      else if (data.role === 'admin') router.push('/admin');
      else router.push('/restaurants');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex" style={{ background: '#f7f3ed' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
        style={{ background: 'linear-gradient(160deg, #1a3a2a 0%, #0f2419 50%, #2d1810 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #d4af37, transparent)', transform: 'translate(20%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #d4af37, transparent)', transform: 'translate(-20%, 20%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg"
            style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>SL</div>
          <div>
            <div className="font-bold text-lg" style={{ color: '#f5f0e8' }}>SL Eats Connect</div>
            <div className="text-xs tracking-widest uppercase" style={{ color: '#d4af37' }}>Eat Local. Eat Sri Lanka.</div>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, #d4af37)' }} />
            <span className="text-xs tracking-widest uppercase font-semibold" style={{ color: '#d4af37' }}>Welcome Back</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#f5f0e8' }}>
            Discover the<br />Taste of<br />Sri Lanka
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#a89060' }}>
            From beachfront seafood in Galle to rooftop fine dining in Colombo — your next great meal is waiting.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['200+', 'Restaurants'], ['5 Cities', 'Covered'], ['AI-Powered', 'Booking']].map(([val, label]) => (
              <div key={label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="font-bold text-sm mb-1" style={{ color: '#d4af37' }}>{val}</div>
                <div className="text-xs" style={{ color: '#a89060' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 flex items-center gap-3">
          <UtensilsCrossed size={16} style={{ color: '#d4af37' }} />
          <span className="text-xs italic" style={{ color: '#6b5a3e' }}>&ldquo;Good food is the foundation of genuine happiness.&rdquo;</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#1a3a2a' }}>SL</div>
            <span className="font-bold text-lg" style={{ color: '#1a3a2a' }}>SL Eats Connect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a3a2a' }}>Sign in</h1>
            <p className="text-sm" style={{ color: '#6b5a3e' }}>Welcome back — sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1a3a2a' }}>Email address</label>
              <input
                name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{ background: 'white', border: '1.5px solid #e5d9c5', color: '#1a3a2a' }}
                onFocus={e => e.target.style.borderColor = '#d4af37'}
                onBlur={e => e.target.style.borderColor = '#e5d9c5'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1a3a2a' }}>Password</label>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all outline-none"
                  style={{ background: 'white', border: '1.5px solid #e5d9c5', color: '#1a3a2a' }}
                  onFocus={e => e.target.style.borderColor = '#d4af37'}
                  onBlur={e => e.target.style.borderColor = '#e5d9c5'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#a89060' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)', color: '#f5f0e8', boxShadow: '0 4px 15px rgba(26,58,42,0.3)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#6b5a3e' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold hover:underline" style={{ color: '#1a3a2a' }}>
              Create one
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs transition-colors hover:underline" style={{ color: '#a89060' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
