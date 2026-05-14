'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { User, Mail, Shield, Calendar, Clock, MapPin, ChevronRight, LogOut, Star, Gift, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
  confirmed: 'text-green-400 font-semibold',
  pending: 'text-amber-400 font-semibold',
  cancelled: 'text-red-400 font-semibold',
};

function getTier(balance: number) {
  if (balance >= 1000) return { name: 'VIP', color: 'text-purple-600', bg: 'bg-purple-900/30', next: null, progress: 100 };
  if (balance >= 500)  return { name: 'Regular', color: 'text-primary', bg: 'bg-primary/20', next: 1000, progress: Math.round(((balance - 500) / 500) * 100) };
  return { name: 'Foodie', color: 'text-amber-600', bg: 'bg-amber-900/30', next: 500, progress: Math.round((balance / 500) * 100) };
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a1a10' }}>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVendor = user.role === 'vendor';
  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const tier = getTier(pointsBalance);

  // Tabs — vendors don't see Eats Points
  const tabs = [
    { id: 'info' as const, label: 'Personal Info' },
    { id: 'reservations' as const, label: 'My Reservations' },
    ...(!isVendor ? [{ id: 'points' as const, label: 'Eats Points' }] : []),
  ];

  return (
    <main className="min-h-screen" style={{ background: '#0a1a10' }}>
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Profile Header Card */}
        <div className="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: "#f5f0e8" }}>{user.name}</h1>
            <p className="text-sm" style={{ color: "#a89060" }}>{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
              user.role === 'vendor' ? 'bg-blue-900/40 text-blue-300' :
              user.role === 'admin'  ? 'bg-purple-900/40 text-purple-300' :
              'bg-primary/20 text-amber-300'
            }`}>
              {user.role}
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm transition-colors hover:opacity-70" style={{ color: "#a89060" }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 mb-6 w-fit" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab.id ? 'text-white shadow-sm' : 'hover:opacity-80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Personal Info */}
        {activeTab === 'info' && (
          <div className="rounded-2xl divide-y" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderColor: "rgba(212,175,55,0.2)" }}>
            {[
              { icon: User,   label: 'Full Name',     value: user.name },
              { icon: Mail,   label: 'Email Address', value: user.email },
              { icon: Shield, label: 'Account Role',  value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.15)" }}>
                  <Icon size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs mb-0.5" style={{ color: "#a89060" }}>{label}</div>
                  <div className="font-semibold" style={{ color: "#f5f0e8" }}>{value}</div>
                </div>
                <ChevronRight size={16} className="" style={{ color: "#a89060" }} />
              </div>
            ))}

            {/* Vendor shortcut */}
            {isVendor && (
              <div className="px-6 py-5">
                <a
                  href="/vendor/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'oklch(0.585 0.22 29.234)' }}
                >
                  Go to Vendor Dashboard →
                </a>
              </div>
            )}
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
                <Calendar size={40} className="mx-auto mb-4" style={{ color: "#a89060" }} />
                <h3 className="font-semibold mb-2" style={{ color: "#f5f0e8" }}>No reservations yet</h3>
                <p className="text-sm mb-6" style={{ color: "#a89060" }}>When you book a table, your reservations will appear here.</p>
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
                          <h3 className="font-bold text-lg" style={{ color: "#f5f0e8" }}>{restaurantName}</h3>
                          {restaurantCity && (
                            <div className="flex items-center gap-1 text-sm mt-0.5" style={{ color: "#a89060" }}>
                              <MapPin size={13} /><span>{restaurantCity}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize self-start ${STATUS_STYLES[r.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm" style={{ color: "#a89060" }}>
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

        {/* Tab: Eats Points — customers only */}
        {activeTab === 'points' && !isVendor && (
          <div className="space-y-5">
            {loadingPoints ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Balance card */}
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
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

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                    {[
                      { tier: 'Foodie', range: '0 – 499 pts', color: 'text-amber-600', bg: 'bg-amber-900/30' },
                      { tier: 'Regular', range: '500 – 999 pts', color: 'text-primary', bg: 'bg-primary/20' },
                      { tier: 'VIP', range: '1,000+ pts', color: 'text-purple-600', bg: 'bg-purple-900/30' },
                    ].map(t => (
                      <div key={t.tier} className={`rounded-xl p-2 ${t.bg}`}>
                        <div className={`font-bold ${t.color}`}>{t.tier}</div>
                        <div className="" style={{ color: "#a89060" }}>{t.range}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: "#a89060" }}>Points expire 12 months after they are earned.</p>
                </div>

                {/* Redeem card */}
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.15)" }}>
                      <Gift size={22} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: "#f5f0e8" }}>Redeem for Dining Discount</h3>
                      <p className="text-sm mb-4" style={{ color: "#a89060" }}>Use 500 points to get a discount code for your next visit at any partner restaurant.</p>

                      {discountCode ? (
                        <div className="rounded-xl px-5 py-4 text-center" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
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
                            <p className="text-xs mt-2" style={{ color: "#a89060" }}>You need {500 - pointsBalance} more points to redeem.</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction history */}
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <h3 className="font-bold mb-4" style={{ color: "#f5f0e8" }}>Points History</h3>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: "#a89060" }}>No transactions yet. Make a reservation to earn your first points!</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((t) => (
                        <div key={t._id} className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'earn' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                            {t.type === 'earn'
                              ? <ArrowDownCircle size={18} className="text-green-600" />
                              : <ArrowUpCircle size={18} className="text-red-500" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold" style={{ color: "#f5f0e8" }}>{t.description}</p>
                            <p className="text-xs" style={{ color: "#a89060" }}>{new Date(t.createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</p>
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
