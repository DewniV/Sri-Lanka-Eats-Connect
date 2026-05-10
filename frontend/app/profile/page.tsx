'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { User, Mail, Shield, Calendar, Clock, MapPin, ChevronRight, LogOut, Star, Gift, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Reservation {
  _id: string;
  restaurantId: { name: string; city: string } | string;
  date: string;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  createdAt: string;
}

interface PointsTransaction {
  _id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
};

function getTier(balance: number) {
  if (balance >= 1500) return { name: 'VIP', color: 'text-purple-600', bg: 'bg-purple-100', next: null, progress: 100 };
  if (balance >= 500)  return { name: 'Regular', color: 'text-primary', bg: 'bg-primary/10', next: 1500, progress: Math.round(((balance - 500) / 1000) * 100) };
  return { name: 'Foodie', color: 'text-amber-600', bg: 'bg-amber-100', next: 500, progress: Math.round((balance / 500) * 100) };
}

export default function ProfilePage() {
  const [user, setUser]                         = useState<AuthUser | null>(null);
  const [reservations, setReservations]         = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [activeTab, setActiveTab]               = useState<'info' | 'reservations' | 'points'>('info');
  const [pointsBalance, setPointsBalance]       = useState(0);
  const [transactions, setTransactions]         = useState<PointsTransaction[]>([]);
  const [loadingPoints, setLoadingPoints]       = useState(false);
  const [redeemLoading, setRedeemLoading]       = useState(false);
  const [discountCode, setDiscountCode]         = useState<string | null>(null);
  const [redeemError, setRedeemError]           = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('sl_eats_user');
    if (!stored) { router.push('/login'); return; }
    try { setUser(JSON.parse(stored)); } catch { router.push('/login'); }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'reservations' && user) fetchReservations();
    if (activeTab === 'points' && user) fetchPoints();
  }, [activeTab, user]);

  const fetchReservations = async () => {
    if (!user) return;
    setLoadingReservations(true);
    try {
      const token = localStorage.getItem('sl_eats_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservations/customer/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReservations(await res.json());
    } catch { /* silently fail */ } finally { setLoadingReservations(false); }
  };

  const fetchPoints = async () => {
    if (!user) return;
    setLoadingPoints(true);
    try {
      const token = localStorage.getItem('sl_eats_token');
      const [balRes, histRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/points/balance`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/points/history`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (balRes.ok)  { const d = await balRes.json();  setPointsBalance(d.balance); }
      if (histRes.ok) { const d = await histRes.json(); setTransactions(d); }
    } catch { /* silently fail */ } finally { setLoadingPoints(false); }
  };

  const handleRedeem = async () => {
    setRedeemLoading(true);
    setRedeemError(null);
    setDiscountCode(null);
    try {
      const token = localStorage.getItem('sl_eats_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/points/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) { setRedeemError(data.message); return; }
      setDiscountCode(data.discountCode);
      setPointsBalance(data.newBalance);
      fetchPoints();
    } catch { setRedeemError('Something went wrong. Please try again.'); }
    finally { setRedeemLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('sl_eats_user');
    localStorage.removeItem('sl_eats_token');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const tier = getTier(pointsBalance);

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
              user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
              user.role === 'admin'  ? 'bg-purple-100 text-purple-700' :
              'bg-primary/10 text-primary'
            }`}>
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-6 w-fit">
          {(['info', 'reservations', 'points'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'info' ? 'Personal Info' : tab === 'reservations' ? 'My Reservations' : 'Eats Points'}
            </button>
          ))}
        </div>

        {/* Tab: Personal Info */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl border border-border shadow-sm divide-y divide-border">
            {[
              { icon: User,   label: 'Full Name',     value: user.name },
              { icon: Mail,   label: 'Email Address', value: user.email },
              { icon: Shield, label: 'Account Role',  value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className="font-semibold text-foreground">{value}</div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {/* Tab: My Reservations */}
        {activeTab === 'reservations' && (
          <div>
            {loadingReservations ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No reservations yet</h3>
                <p className="text-sm text-muted-foreground mb-6">When you book a table, your reservations will appear here.</p>
                <a href="/restaurants" className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
                  Browse Restaurants
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => {
                  const restaurantName = typeof r.restaurantId === 'object' ? r.restaurantId.name : 'Restaurant';
                  const restaurantCity = typeof r.restaurantId === 'object' ? r.restaurantId.city : '';
                  return (
                    <div key={r._id} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{restaurantName}</h3>
                          {restaurantCity && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <MapPin size={13} /><span>{restaurantCity}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize self-start ${STATUS_STYLES[r.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{new Date(r.date).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</span></div>
                        <div className="flex items-center gap-1.5"><Clock size={14} /><span>{r.time}</span></div>
                        <div className="flex items-center gap-1.5"><User size={14} /><span>{r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}</span></div>
                      </div>
                      {r.specialRequests && (
                        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-foreground">Note:</span> {r.specialRequests}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Eats Points */}
        {activeTab === 'points' && (
          <div className="space-y-5">
            {loadingPoints ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Balance card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Your Balance</p>
                      <p className="text-5xl font-black text-foreground">{pointsBalance} <span className="text-lg font-semibold text-muted-foreground">pts</span></p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl ${tier.bg}`}>
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className={tier.color} />
                        <span className={`text-sm font-bold ${tier.color}`}>{tier.name}</span>
                      </div>
                    </div>
                  </div>

                  {tier.next && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{pointsBalance} pts</span>
                        <span>{tier.next} pts to next tier</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${tier.progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Redeem card */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Gift size={22} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">Redeem for Dining Discount</h3>
                      <p className="text-sm text-muted-foreground mb-4">Use 500 points to get a discount code for your next visit at any partner restaurant.</p>

                      {discountCode ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-center">
                          <p className="text-xs text-green-600 font-semibold uppercase tracking-widest mb-1">Your Discount Code</p>
                          <p className="text-2xl font-black text-green-700 tracking-widest">{discountCode}</p>
                          <p className="text-xs text-green-600 mt-1">Show this to the restaurant when you arrive</p>
                        </div>
                      ) : (
                        <>
                          {redeemError && <p className="text-sm text-red-500 mb-3">{redeemError}</p>}
                          <button
                            onClick={handleRedeem}
                            disabled={redeemLoading || pointsBalance < 500}
                            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {redeemLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                            Redeem 500 Points
                          </button>
                          {pointsBalance < 500 && (
                            <p className="text-xs text-muted-foreground mt-2">You need {500 - pointsBalance} more points to redeem.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction history */}
                <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="font-bold text-foreground mb-4">Points History</h3>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No transactions yet. Make a reservation to earn your first points!</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((t) => (
                        <div key={t._id} className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'earn' ? 'bg-green-50' : 'bg-red-50'}`}>
                            {t.type === 'earn'
                              ? <ArrowDownCircle size={18} className="text-green-600" />
                              : <ArrowUpCircle size={18} className="text-red-500" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{t.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</p>
                          </div>
                          <span className={`text-sm font-bold ${t.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                            {t.type === 'earn' ? '+' : '-'}{t.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
