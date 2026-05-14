'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export const dynamic = 'force-dynamic';

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalReservations: number;
  totalReviews: number;
  pendingReservations: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Restaurant {
  _id: string;
  name: string;
  city: string;
  cuisineType: string;
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

interface Reservation {
  _id: string;
  customerName: string;
  partySize: number;
  reservationDate: string;
  status: string;
  restaurant?: { name: string; city: string };
  customer?: { name: string; email: string };
}

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  restaurant?: { name: string; city: string };
}

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'restaurants' | 'reservations' | 'reviews'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const getAuth = () => {
    const token = localStorage.getItem('sl_eats_token');
    const user = JSON.parse(localStorage.getItem('sl_eats_user') || 'null');
    return { token, user };
  };

  useEffect(() => {
    const { token, user } = getAuth();
    if (!token || !user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) fetchUsers();
    if (activeTab === 'restaurants' && restaurants.length === 0) fetchRestaurants();
    if (activeTab === 'reservations' && reservations.length === 0) fetchReservations();
    if (activeTab === 'reviews' && reviews.length === 0) fetchReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const authHeaders = () => {
    const { token } = getAuth();
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/admin/stats`, { headers: authHeaders() });
      const data = await res.json();
      setStats(data.stats);
      setRecentReservations(data.recentReservations || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
    setUsers(await res.json());
  };

  const fetchRestaurants = async () => {
    const res = await fetch(`${API}/api/admin/restaurants`, { headers: authHeaders() });
    setRestaurants(await res.json());
  };

  const fetchReservations = async () => {
    const res = await fetch(`${API}/api/admin/reservations`, { headers: authHeaders() });
    setReservations(await res.json());
  };

  const fetchReviews = async () => {
    const res = await fetch(`${API}/api/admin/reviews`, { headers: authHeaders() });
    setReviews(await res.json());
  };

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const changeUserRole = async (userId: string, role: string) => {
    const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      showMsg('Role updated successfully.');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`${API}/api/admin/users/${userId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      setUsers(prev => prev.filter(u => u._id !== userId));
      showMsg('User deleted.');
    }
  };

  const toggleRestaurantField = async (restaurantId: string, field: 'isVerified' | 'isActive', value: boolean) => {
    const res = await fetch(`${API}/api/admin/restaurants/${restaurantId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      setRestaurants(prev => prev.map(r => r._id === restaurantId ? { ...r, [field]: value } : r));
      showMsg('Restaurant updated.');
    }
  };

  const deleteRestaurant = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    const res = await fetch(`${API}/api/admin/restaurants/${restaurantId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      setRestaurants(prev => prev.filter(r => r._id !== restaurantId));
      showMsg('Restaurant deleted.');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const res = await fetch(`${API}/api/admin/reviews/${reviewId}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) {
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      showMsg('Review deleted.');
    }
  };

  const TABS = [
    { id: 'overview',     label: '📊 Overview' },
    { id: 'users',        label: '👥 Users' },
    { id: 'restaurants',  label: '🍽️ Restaurants' },
    { id: 'reservations', label: '📅 Reservations' },
    { id: 'reviews',      label: '⭐ Reviews' },
  ] as const;

  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: '#f7f3ed' }}>
        <Navigation />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: '#f7f3ed' }}>
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage all users, restaurants, reservations, and reviews.</p>
          </div>

          {/* Action message */}
          {actionMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✓ {actionMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                {[
                  { label: 'Total Users',        value: stats.totalUsers,        color: 'bg-blue-50 text-blue-700' },
                  { label: 'Restaurants',         value: stats.totalRestaurants,  color: 'bg-green-50 text-green-700' },
                  { label: 'Reservations',        value: stats.totalReservations, color: 'bg-purple-50 text-purple-700' },
                  { label: 'Pending',             value: stats.pendingReservations, color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Reviews',             value: stats.totalReviews,      color: 'bg-red-50 text-red-700' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.color} rounded-xl p-5 text-center`}>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Reservations</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Restaurant</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Party</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReservations.map((r, i) => (
                        <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 font-medium">{r.customerName}</td>
                          <td className="px-4 py-3 text-gray-600">{r.restaurant?.name || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{new Date(r.reservationDate).toLocaleDateString('en-LK')}</td>
                          <td className="px-4 py-3 text-gray-600">{r.partySize}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">{users.length} users total</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={e => changeUserRole(u._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                        >
                          <option value="customer">customer</option>
                          <option value="vendor">vendor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-LK')}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RESTAURANTS TAB */}
          {activeTab === 'restaurants' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">{restaurants.length} restaurants total</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Cuisine</th>
                    <th className="px-4 py-3 text-left">Rating</th>
                    <th className="px-4 py-3 text-left">Verified</th>
                    <th className="px-4 py-3 text-left">Active</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((r, i) => (
                    <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.city}</td>
                      <td className="px-4 py-3 text-gray-600">{r.cuisineType}</td>
                      <td className="px-4 py-3 text-gray-600">⭐ {r.averageRating} ({r.totalReviews})</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRestaurantField(r._id, 'isVerified', !r.isVerified)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                        >
                          {r.isVerified ? '✓ Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRestaurantField(r._id, 'isActive', !r.isActive)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                        >
                          {r.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteRestaurant(r._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">{reservations.length} reservations total</div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Restaurant</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Party</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, i) => (
                    <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{r.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.restaurant?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(r.reservationDate).toLocaleDateString('en-LK')}</td>
                      <td className="px-4 py-3 text-gray-600">{r.partySize}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{(r as unknown as { source?: string }).source || 'web'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">{review.customerName}</div>
                      <div className="text-xs text-gray-400">{review.restaurant?.name} — {new Date(review.createdAt).toLocaleDateString('en-LK')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-500 font-bold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}
