'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  CalendarDays, Users, Clock, CheckCircle2, XCircle,
  UtensilsCrossed, TrendingUp, Phone, Mail, MessageSquare, Edit3, Save
} from 'lucide-react';

interface Reservation {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationDate: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  source: 'web' | 'chatbot';
  language: 'en' | 'si' | 'ta';
  createdAt: string;
}

interface Restaurant {
  _id: string;
  name: string;
  cuisineType: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  priceRange: string;
  openingHours: Record<string, string>;
  coverImage: string;
  rating: number;
  totalReviews: number;
}

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const SOURCE_LABELS = {
  web:     { label: 'Web Form',   icon: '🌐' },
  chatbot: { label: 'AI Chatbot', icon: '🤖' },
};

const LANG_LABELS = { en: '🇬🇧 EN', si: '🇱🇰 සි', ta: '🇱🇰 த' };

export default function VendorDashboard() {
  const router = useRouter();
  const [restaurant, setRestaurant]   = useState<Restaurant | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updating, setUpdating]       = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<'reservations' | 'edit'>('reservations');

  // Edit form state
  const [editForm, setEditForm]       = useState<Partial<Restaurant>>({});
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('sl_eats_user');
    const token   = localStorage.getItem('sl_eats_token');
    if (!userStr || !token) { router.push('/login'); return; }
    const user = JSON.parse(userStr);
    if (user.role !== 'vendor') { router.push('/'); return; }
    fetchVendorData(token);
  }, []);

  const fetchVendorData = async (token: string) => {
    try {
      const rRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allRestaurants: Restaurant[] = await rRes.json();

      const userStr = localStorage.getItem('sl_eats_user');
      const user = JSON.parse(userStr!);
      const vendorRestaurant = allRestaurants.find((r: Restaurant & { owner?: { _id?: string } }) =>
        r.owner?._id === user._id
      ) || allRestaurants[0];

      if (!vendorRestaurant) { setLoading(false); return; }
      setRestaurant(vendorRestaurant);
      setEditForm({
        name:        vendorRestaurant.name,
        description: vendorRestaurant.description,
        address:     vendorRestaurant.address,
        phone:       vendorRestaurant.phone,
        email:       vendorRestaurant.email,
        cuisineType: vendorRestaurant.cuisineType,
        priceRange:  vendorRestaurant.priceRange,
        coverImage:  vendorRestaurant.coverImage,
      });

      const resRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/restaurant/${vendorRestaurant._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resRes.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('sl_eats_token');
    setUpdating(id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: status as Reservation['status'] } : r));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleSaveRestaurant = async () => {
    if (!restaurant) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const token = localStorage.getItem('sl_eats_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${restaurant._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setRestaurant(updated);
        setSaveMsg('Changes saved successfully!');
      } else {
        setSaveMsg('Failed to save. Please try again.');
      }
    } catch {
      setSaveMsg('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  const stats = {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    today:     reservations.filter(r => {
      const d = new Date(r.reservationDate);
      return d.toDateString() === new Date().toDateString();
    }).length,
    chatbot: reservations.filter(r => r.source === 'chatbot').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
            {restaurant && (
              <p className="text-gray-500 mt-1">
                Managing <span className="text-primary font-semibold">{restaurant.name}</span> · {restaurant.city}
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Bookings',   value: stats.total,     icon: CalendarDays,  color: 'text-blue-600',   bg: 'bg-blue-50' },
              { label: 'Pending',          value: stats.pending,   icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Confirmed',        value: stats.confirmed, icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
              { label: "Today's Bookings", value: stats.today,     icon: TrendingUp,    color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Via AI Chatbot',   value: stats.chatbot,   icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={20} className={color} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
            {(['reservations', 'edit'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'reservations' ? <><UtensilsCrossed size={14} /> Reservations</> : <><Edit3 size={14} /> Edit Restaurant</>}
              </button>
            ))}
          </div>

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-primary" />
                  <h2 className="font-semibold text-gray-900">Reservations</h2>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{filtered.length}</span>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                        filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <CalendarDays size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No reservations found</p>
                  <p className="text-gray-300 text-sm mt-1">Reservations will appear here once customers book</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Party</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(res => (
                        <tr key={res._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 text-sm">{res.customerName}</p>
                            {res.customerEmail && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={10} /> {res.customerEmail}</p>}
                            {res.customerPhone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone size={10} /> {res.customerPhone}</p>}
                            {res.specialRequests && <p className="text-xs text-gray-400 italic mt-1 max-w-[200px] truncate">"{res.specialRequests}"</p>}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{new Date(res.reservationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <p className="text-xs text-gray-400">{new Date(res.reservationDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1"><Users size={14} className="text-gray-400" /><span className="text-sm text-gray-700">{res.partySize}</span></div>
                            <span className="text-xs text-gray-400">{LANG_LABELS[res.language]}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm">{SOURCE_LABELS[res.source]?.icon} {SOURCE_LABELS[res.source]?.label}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[res.status]}`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {res.status === 'pending' && (
                                <>
                                  <button onClick={() => updateStatus(res._id, 'confirmed')} disabled={updating === res._id} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                    <CheckCircle2 size={12} /> Confirm
                                  </button>
                                  <button onClick={() => updateStatus(res._id, 'cancelled')} disabled={updating === res._id} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50">
                                    <XCircle size={12} /> Cancel
                                  </button>
                                </>
                              )}
                              {res.status === 'confirmed' && (
                                <button onClick={() => updateStatus(res._id, 'completed')} disabled={updating === res._id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50">
                                  <CheckCircle2 size={12} /> Mark Done
                                </button>
                              )}
                              {(res.status === 'cancelled' || res.status === 'completed') && (
                                <span className="text-xs text-gray-400 italic">No actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Edit Restaurant Tab */}
          {activeTab === 'edit' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                <Edit3 size={18} className="text-primary" /> Edit Restaurant Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { key: 'name',        label: 'Restaurant Name',  type: 'text' },
                  { key: 'cuisineType', label: 'Cuisine Type',     type: 'text' },
                  { key: 'address',     label: 'Address',          type: 'text' },
                  { key: 'phone',       label: 'Phone Number',     type: 'text' },
                  { key: 'email',       label: 'Email Address',    type: 'email' },
                  { key: 'coverImage',  label: 'Cover Image URL',  type: 'url' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={(editForm as Record<string, string>)[key] || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                ))}

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Price Range</label>
                  <select
                    value={editForm.priceRange || 'mid'}
                    onChange={e => setEditForm(prev => ({ ...prev, priceRange: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  >
                    <option value="budget">Budget (LKR 500–1,500)</option>
                    <option value="mid">Mid-range (LKR 1,500–4,000)</option>
                    <option value="upscale">Upscale (LKR 4,000–8,000)</option>
                    <option value="fine">Fine Dining (LKR 8,000+)</option>
                  </select>
                </div>

                {/* Description — full width */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSaveRestaurant}
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Save size={16} />
                  }
                  Save Changes
                </button>
                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                    {saveMsg}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
