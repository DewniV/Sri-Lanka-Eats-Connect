'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  cuisineType: string;
  priceRange: string;
  totalTables: number;
  availableTables: number;
  availabilityNote: string;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  lastAvailabilityUpdate?: string;
}

interface Reservation {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  status: string;
  specialRequests: string;
  source: string;
}

interface Review {
  _id: string;
  customer: { name: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
  vendorReply?: string;
  vendorReplyAt?: string;
}

type Tab = 'overview' | 'reservations' | 'reviews' | 'availability' | 'edit';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'];
const PRICE_RANGES = [
  { value: 'budget', label: 'Budget (under LKR 1,000)' },
  { value: 'mid', label: 'Mid-range (LKR 1,000–5,000)' },
  { value: 'upscale', label: 'Upscale (LKR 5,000–15,000)' },
  { value: 'fine', label: 'Fine Dining (above LKR 15,000)' },
];

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Availability form state
  const [availForm, setAvailForm] = useState({
    totalTables: '',
    availableTables: '',
    availabilityNote: '',
  });
  const [availSaving, setAvailSaving] = useState(false);

  // Vendor reply state — keyed by review._id
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replySaving, setReplySaving] = useState<Record<string, boolean>>({});

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    try {
      // Fetch restaurant
      const rRes = await fetch(`${API}/api/restaurants/vendor/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const r = Array.isArray(rData) ? rData[0] : rData;
        if (r) {
          setRestaurant(r);
          setEditForm(r);
          setAvailForm({
            totalTables: String(r.totalTables ?? 10),
            availableTables: String(r.availableTables ?? 10),
            availabilityNote: r.availabilityNote ?? '',
          });

          // Fetch reservations
          const resRes = await fetch(`${API}/api/reservations/restaurant/${r._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resRes.ok) setReservations(await resRes.json());

          // Fetch reviews
          const revRes = await fetch(`${API}/api/reviews/${r._id}`);
          if (revRes.ok) setReviews(await revRes.json());
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const u = JSON.parse(stored) as User;
    if (u.role !== 'vendor') { router.push('/'); return; }
    setUser(u);
    fetchData();
  }, [fetchData, router]);

  // Save restaurant edits
  const handleEditSave = async () => {
    if (!restaurant) return;
    setEditSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API}/api/restaurants/${restaurant._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      setRestaurant(data);
      setMessage('Restaurant details updated successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setEditSaving(false);
    }
  };

  // Save availability
  const handleAvailSave = async () => {
    if (!restaurant) return;
    setAvailSaving(true);
    setError('');
    setMessage('');

    const total = parseInt(availForm.totalTables);
    const avail = parseInt(availForm.availableTables);

    if (isNaN(total) || total < 0) { setError('Total tables must be a valid number.'); setAvailSaving(false); return; }
    if (isNaN(avail) || avail < 0) { setError('Available tables must be a valid number.'); setAvailSaving(false); return; }
    if (avail > total) { setError('Available tables cannot exceed total tables.'); setAvailSaving(false); return; }

    try {
      const res = await fetch(`${API}/api/restaurants/${restaurant._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          totalTables: total,
          availableTables: avail,
          availabilityNote: availForm.availabilityNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update availability');
      setRestaurant(prev => prev ? { ...prev, ...data } : prev);
      setMessage('Table availability updated! Nila chatbot will now reflect these changes in real time.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setAvailSaving(false);
    }
  };

  // Submit vendor reply to a review
  const handleReplySubmit = async (reviewId: string) => {
    const reply = (replyDrafts[reviewId] || '').trim();
    if (!reply) return;
    setReplySaving(prev => ({ ...prev, [reviewId]: true }));
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save reply');
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, vendorReply: reply, vendorReplyAt: new Date().toISOString() } : r));
      setReplyOpen(prev => ({ ...prev, [reviewId]: false }));
      setReplyDrafts(prev => ({ ...prev, [reviewId]: '' }));
      setMessage('Reply posted successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setReplySaving(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Update reservation status
  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API}/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        setMessage(`Reservation ${status}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusColor = (s: string) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }[s] || 'bg-gray-100 text-gray-700');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: 'oklch(0.585 0.22 29.234)', borderTopColor: 'transparent' }} />
        <p className="text-gray-500 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'reservations', label: `Reservations${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: '📅' },
    { id: 'availability', label: 'Table Availability', icon: '🪑' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'edit', label: 'Edit Restaurant', icon: '✏️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-sm" style={{ backgroundColor: 'oklch(0.585 0.22 29.234)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Vendor Dashboard</h1>
            <p className="text-sm opacity-80">{restaurant?.name || 'Your Restaurant'}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-90">Welcome, {user?.name}</span>
            <button
              onClick={() => { localStorage.clear(); router.push('/'); }}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Feedback messages */}
        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
            <span>✅ {message}</span>
            <button onClick={() => setMessage('')} className="text-green-600 hover:text-green-800">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              style={activeTab === tab.id ? { backgroundColor: 'oklch(0.585 0.22 29.234)' } : {}}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Reservations', value: reservations.length, icon: '📅' },
                { label: 'Pending', value: pendingCount, icon: '⏳' },
                { label: 'Confirmed', value: confirmedCount, icon: '✅' },
                { label: 'Reviews', value: reviews.length, icon: '⭐' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {restaurant && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Restaurant Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">City:</span> <span className="font-medium">{restaurant.city || '—'}</span></div>
                  <div><span className="text-gray-500">Cuisine:</span> <span className="font-medium">{restaurant.cuisineType || '—'}</span></div>
                  <div><span className="text-gray-500">Price Range:</span> <span className="font-medium capitalize">{restaurant.priceRange || '—'}</span></div>
                  <div><span className="text-gray-500">Rating:</span> <span className="font-medium">{restaurant.averageRating?.toFixed(1) || '0.0'} ⭐ ({restaurant.totalReviews} reviews)</span></div>
                  <div>
                    <span className="text-gray-500">Tables Available:</span>{' '}
                    <span className={`font-medium ${restaurant.availableTables === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {restaurant.availableTables} / {restaurant.totalTables}
                    </span>
                  </div>
                  <div><span className="text-gray-500">Status:</span> <span className={`font-medium ${restaurant.isActive ? 'text-green-600' : 'text-red-600'}`}>{restaurant.isActive ? 'Active' : 'Inactive'}</span></div>
                </div>
                {restaurant.availabilityNote && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    📌 Availability note: {restaurant.availabilityNote}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RESERVATIONS TAB ── */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">All Reservations ({reservations.length})</h3>
            </div>
            {reservations.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">📅</div>
                <p>No reservations yet. They will appear here once customers book.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reservations.map(r => (
                  <div key={r._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-gray-800">{r.customerName}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {formatDate(r.reservationDate)} · {r.partySize} people
                        </div>
                        {r.customerEmail && <div className="text-xs text-gray-400">{r.customerEmail}</div>}
                        {r.customerPhone && <div className="text-xs text-gray-400">{r.customerPhone}</div>}
                        {r.specialRequests && (
                          <div className="text-xs text-gray-500 mt-1 italic">"{r.specialRequests}"</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">via {r.source}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                          {r.status}
                        </span>
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateReservationStatus(r._id, 'confirmed')}
                              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateReservationStatus(r._id, 'cancelled')}
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1 rounded-full transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => updateReservationStatus(r._id, 'completed')}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2.5 py-1 rounded-full transition"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TABLE AVAILABILITY TAB ── */}
        {activeTab === 'availability' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">Real-Time Table Availability</h3>
              <p className="text-sm text-gray-500 mb-6">
                Update your table availability here. Our AI chatbot <strong>Nila</strong> reads this in real time and will
                tell customers how many tables are free — and warn them when you&apos;re nearly full.
              </p>

              {/* Current status */}
              {restaurant && (
                <div className="mb-6 p-4 rounded-xl border-2 flex items-center gap-4"
                  style={{ borderColor: restaurant.availableTables === 0 ? '#ef4444' : 'oklch(0.585 0.22 29.234)' }}>
                  <div className="text-4xl font-bold"
                    style={{ color: restaurant.availableTables === 0 ? '#ef4444' : 'oklch(0.585 0.22 29.234)' }}>
                    {restaurant.availableTables}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {restaurant.availableTables === 0
                        ? 'Fully Booked'
                        : `Tables Available`}
                    </div>
                    <div className="text-sm text-gray-500">out of {restaurant.totalTables} total tables</div>
                    {restaurant.lastAvailabilityUpdate && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        Last updated: {formatDate(restaurant.lastAvailabilityUpdate)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Tables in Restaurant
                    </label>
                    <input
                      type="number"
                      value={availForm.totalTables}
                      onChange={e => setAvailForm(f => ({ ...f, totalTables: e.target.value }))}
                      min="0"
                      max="500"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">The physical capacity of your restaurant</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currently Available Tables
                    </label>
                    <input
                      type="number"
                      value={availForm.availableTables}
                      onChange={e => setAvailForm(f => ({ ...f, availableTables: e.target.value }))}
                      min="0"
                      max={availForm.totalTables || '500'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">How many tables are free right now</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability Note
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={availForm.availabilityNote}
                    onChange={e => setAvailForm(f => ({ ...f, availabilityNote: e.target.value }))}
                    placeholder='e.g. "Fully booked Friday evening", "Limited seating this weekend"'
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This note will be shown to customers by Nila when they enquire about availability
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAvailSave}
                    disabled={availSaving}
                    className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: 'oklch(0.585 0.22 29.234)' }}
                  >
                    {availSaving ? 'Saving…' : '🪑 Update Availability'}
                  </button>
                  <button
                    onClick={() => setAvailForm(f => ({ ...f, availableTables: '0', availabilityNote: 'Fully booked today' }))}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200"
                  >
                    Mark Fully Booked
                  </button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Update this whenever your availability changes — before service, after large bookings,
                  or when you open up new slots. The chatbot checks this live so customers always get accurate information.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS TAB ── */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Customer Reviews ({reviews.length})</h3>
              {restaurant && (
                <span className="text-sm text-gray-500">
                  Average: {restaurant.averageRating?.toFixed(1) || '0.0'} ⭐
                </span>
              )}
            </div>
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">⭐</div>
                <p>No reviews yet. Reviews from customers will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reviews.map(r => (
                  <div key={r._id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {typeof r.customer === 'object' && r.customer !== null
                            ? (r.customer as { name: string }).name
                            : 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}

                    {/* Existing vendor reply */}
                    {r.vendorReply && (
                      <div className="mt-3 ml-4 p-3 bg-gray-50 border-l-4 rounded-r-lg text-sm text-gray-700"
                        style={{ borderLeftColor: 'oklch(0.585 0.22 29.234)' }}>
                        <div className="font-semibold text-xs mb-1" style={{ color: 'oklch(0.585 0.22 29.234)' }}>
                          Your reply
                          {r.vendorReplyAt && (
                            <span className="text-gray-400 font-normal ml-2">
                              · {new Date(r.vendorReplyAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p>{r.vendorReply}</p>
                        <button
                          onClick={() => {
                            setReplyDrafts(prev => ({ ...prev, [r._id]: r.vendorReply || '' }));
                            setReplyOpen(prev => ({ ...prev, [r._id]: true }));
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 mt-1 underline"
                        >
                          Edit reply
                        </button>
                      </div>
                    )}

                    {/* Reply toggle button (only if no reply yet) */}
                    {!r.vendorReply && !replyOpen[r._id] && (
                      <button
                        onClick={() => setReplyOpen(prev => ({ ...prev, [r._id]: true }))}
                        className="mt-2 text-xs font-medium hover:underline"
                        style={{ color: 'oklch(0.585 0.22 29.234)' }}
                      >
                        ↩ Reply to this review
                      </button>
                    )}

                    {/* Reply input box */}
                    {replyOpen[r._id] && (
                      <div className="mt-3 ml-4">
                        <textarea
                          value={replyDrafts[r._id] || ''}
                          onChange={e => setReplyDrafts(prev => ({ ...prev, [r._id]: e.target.value }))}
                          rows={3}
                          placeholder="Write a professional, friendly reply to this review…"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleReplySubmit(r._id)}
                            disabled={replySaving[r._id] || !(replyDrafts[r._id] || '').trim()}
                            className="px-4 py-1.5 text-xs text-white rounded-lg font-medium transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: 'oklch(0.585 0.22 29.234)' }}
                          >
                            {replySaving[r._id] ? 'Posting…' : 'Post Reply'}
                          </button>
                          <button
                            onClick={() => setReplyOpen(prev => ({ ...prev, [r._id]: false }))}
                            className="px-4 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── EDIT RESTAURANT TAB ── */}
        {activeTab === 'edit' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">Edit Restaurant Details</h3>
              <p className="text-sm text-gray-500 mb-6">
                Keep your listing up to date. A detailed description helps Nila recommend your restaurant more accurately.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    rows={5}
                    placeholder='e.g. "Authentic Sri Lankan rice and curry in Galle, specialising in fresh seafood. Beachfront seating. Vegetarian-friendly. Halal certified."'
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Include cuisine style, specialties, ambiance, dietary options, and location highlights for best chatbot results.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                      value={editForm.city || ''}
                      onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                    >
                      <option value="">Select city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <input
                      type="text"
                      value={editForm.cuisineType || ''}
                      onChange={e => setEditForm(f => ({ ...f, cuisineType: e.target.value }))}
                      placeholder="e.g. Sri Lankan, Seafood, Fusion"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="e.g. 45 Galle Road, Colombo 03"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+94 11 234 5678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <select
                      value={editForm.priceRange || 'mid'}
                      onChange={e => setEditForm(f => ({ ...f, priceRange: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                    >
                      {PRICE_RANGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive ?? true}
                    onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Restaurant is active and accepting reservations
                  </label>
                </div>

                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: 'oklch(0.585 0.22 29.234)' }}
                >
                  {editSaving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
