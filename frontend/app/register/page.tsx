'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Role = 'customer' | 'vendor';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Vendor-only fields
  restaurantName: string;
  restaurantDescription: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantPhone: string;
  restaurantEmail: string;
  restaurantCuisineType: string;
  restaurantPriceRange: string;
  totalTables: string;
}

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'];
const PRICE_RANGES = [
  { value: 'budget', label: 'Budget (under LKR 1,000 per person)' },
  { value: 'mid', label: 'Mid-range (LKR 1,000 – 5,000)' },
  { value: 'upscale', label: 'Upscale (LKR 5,000 – 15,000)' },
  { value: 'fine', label: 'Fine Dining (above LKR 15,000)' },
];

const DESCRIPTION_HINT = `Describe your restaurant in a way that helps customers (and our AI chatbot) understand what makes you special. Include:
• Cuisine style and signature dishes (e.g. "Authentic Sri Lankan rice and curry, seafood kottu, string hoppers")
• Ambiance and setting (e.g. "Beachfront seating with ocean views", "Rooftop terrace", "Cosy family-friendly interior")
• Dietary options (e.g. "Vegetarian-friendly", "Vegan options available", "Halal certified")
• Location highlights (e.g. "5 minutes from Galle Fort", "Overlooking Kandy Lake")

Example: "Authentic Sri Lankan rice and curry restaurant in Galle, specialising in fresh seafood and traditional curries. Beachfront seating with stunning ocean views. Vegetarian-friendly with daily specials. Halal certified. 5 minutes from Galle Fort."`;

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    restaurantDescription: '',
    restaurantAddress: '',
    restaurantCity: '',
    restaurantPhone: '',
    restaurantEmail: '',
    restaurantCuisineType: '',
    restaurantPriceRange: 'mid',
    totalTables: '10',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (role === 'vendor' && !form.restaurantName.trim()) {
      setError('Restaurant name is required for vendor registration.');
      return;
    }
    if (role === 'vendor' && !form.restaurantCity) {
      setError('Please select your restaurant city.');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };

      if (role === 'vendor') {
        payload.restaurantName = form.restaurantName;
        payload.restaurantDescription = form.restaurantDescription;
        payload.restaurantAddress = form.restaurantAddress;
        payload.restaurantCity = form.restaurantCity;
        payload.restaurantPhone = form.restaurantPhone;
        payload.restaurantEmail = form.restaurantEmail || form.email;
        payload.restaurantCuisineType = form.restaurantCuisineType;
        payload.restaurantPriceRange = form.restaurantPriceRange;
        payload.totalTables = parseInt(form.totalTables) || 10;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      }));

      // Redirect based on role
      if (role === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ background: '#f7f3ed' }}>
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-lg" style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)', color: '#d4af37' }}>SL</div>
            <h1 className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>SL Eats Connect</h1>
          </Link>
          <p className="mt-1 text-sm" style={{ color: '#6b5a3e' }}>Join Sri Lanka&apos;s premier dining platform</p>
        </div>

        {/* Role Tabs */}
        <div className="flex rounded-xl overflow-hidden mb-6 shadow-sm" style={{ border: '1.5px solid #e5d9c5', background: 'white' }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={role === 'customer'
              ? { background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)', color: '#d4af37' }
              : { color: '#6b5a3e', background: 'white' }}
          >
            🍽️ I&apos;m a Food Lover
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className="flex-1 py-3 text-sm font-semibold transition-all"
            style={role === 'vendor'
              ? { background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)', color: '#d4af37' }
              : { color: '#6b5a3e', background: 'white' }}
          >
            🏪 I&apos;m a Restaurant Owner
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl shadow-lg p-8 space-y-5" style={{ background: 'white', border: '1px solid #e5d9c5' }}>
          {/* Account Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {role === 'vendor' ? 'Your Account Details' : 'Create Your Account'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Priya Fernando"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'oklch(0.585 0.22 29.234)' } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Min. 6 characters"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Repeat password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor-only: Restaurant Details */}
          {role === 'vendor' && (
            <div className="border-t pt-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Your Restaurant Details</h2>
              <p className="text-sm text-gray-500 mb-4">
                This creates your restaurant listing on SL Eats Connect. You can update all details later in your dashboard.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={form.restaurantName}
                    onChange={handleChange}
                    required={role === 'vendor'}
                    placeholder="e.g. The Spice Garden"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>

                {/* Description with hint */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Restaurant Description
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHint(h => !h)}
                      className="text-xs font-medium underline"
                      style={{ color: 'oklch(0.585 0.22 29.234)' }}
                    >
                      {showHint ? 'Hide tips' : 'Writing tips ✨'}
                    </button>
                  </div>

                  {showHint && (
                    <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 whitespace-pre-line leading-relaxed">
                      {DESCRIPTION_HINT}
                    </div>
                  )}

                  <textarea
                    name="restaurantDescription"
                    value={form.restaurantDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder='e.g. "Authentic Sri Lankan rice and curry in Galle, specialising in fresh seafood. Beachfront seating with ocean views. Vegetarian-friendly. Halal certified."'
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    A good description helps our AI chatbot Nila recommend your restaurant to the right customers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <select
                      name="restaurantCity"
                      value={form.restaurantCity}
                      onChange={handleChange}
                      required={role === 'vendor'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                    >
                      <option value="">Select city</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <input
                      type="text"
                      name="restaurantCuisineType"
                      value={form.restaurantCuisineType}
                      onChange={handleChange}
                      placeholder="e.g. Sri Lankan, Seafood"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="restaurantAddress"
                    value={form.restaurantAddress}
                    onChange={handleChange}
                    placeholder="e.g. 45 Galle Road, Colombo 03"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Phone</label>
                    <input
                      type="tel"
                      name="restaurantPhone"
                      value={form.restaurantPhone}
                      onChange={handleChange}
                      placeholder="e.g. +94 11 234 5678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Email</label>
                    <input
                      type="email"
                      name="restaurantEmail"
                      value={form.restaurantEmail}
                      onChange={handleChange}
                      placeholder="Defaults to your account email"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <select
                      name="restaurantPriceRange"
                      value={form.restaurantPriceRange}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                    >
                      {PRICE_RANGES.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Tables
                      <span className="text-gray-400 font-normal ml-1">(for availability tracking)</span>
                    </label>
                    <input
                      type="number"
                      name="totalTables"
                      value={form.totalTables}
                      onChange={handleChange}
                      min="1"
                      max="200"
                      placeholder="10"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d5a3d)', color: '#f5f0e8', boxShadow: '0 4px 15px rgba(26,58,42,0.3)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#d4af37', borderTopColor: 'transparent' }} />
                Creating account...
              </span>
            ) : role === 'vendor'
              ? 'Create Account & List My Restaurant'
              : 'Create Account'}
          </button>

          <p className="text-center text-sm" style={{ color: '#6b5a3e' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: '#1a3a2a' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
