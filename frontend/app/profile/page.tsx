'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { User, Mail, Shield, Calendar, Clock, MapPin, ChevronRight, LogOut } from 'lucide-react';

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

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reservations'>('info');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('sl_eats_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'reservations' && user) {
      fetchReservations();
    }
  }, [activeTab, user]);

  const fetchReservations = async () => {
    if (!user) return;
    setLoadingReservations(true);
    try {
      const token = localStorage.getItem('sl_eats_token');
      const res = await fetch(`http://localhost:5000/api/reservations/customer/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch {
      // silently fail — reservations simply won't show
    } finally {
      setLoadingReservations(false);
    }
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

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-muted/30">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${
              user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
              'bg-primary/10 text-primary'
            }`}>
              {user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-xl p-1 mb-6 w-fit">
          {(['info', 'reservations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'info' ? 'Personal Info' : 'My Reservations'}
            </button>
          ))}
        </div>

        {/* Tab: Personal Info */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl border border-border shadow-sm divide-y divide-border">
            {[
              { icon: User, label: 'Full Name', value: user.name },
              { icon: Mail, label: 'Email Address', value: user.email },
              { icon: Shield, label: 'Account Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
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
                <p className="text-sm text-muted-foreground mb-6">
                  When you book a table at a restaurant, your reservations will appear here.
                </p>
                <a
                  href="/restaurants"
                  className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Browse Restaurants
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map((r) => {
                  const restaurantName =
                    typeof r.restaurantId === 'object' ? r.restaurantId.name : 'Restaurant';
                  const restaurantCity =
                    typeof r.restaurantId === 'object' ? r.restaurantId.city : '';
                  return (
                    <div key={r._id} className="bg-white rounded-2xl border border-border shadow-sm p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground text-lg">{restaurantName}</h3>
                          {restaurantCity && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                              <MapPin size={13} />
                              <span>{restaurantCity}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize self-start ${STATUS_STYLES[r.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{new Date(r.date).toLocaleDateString('en-LK', { dateStyle: 'medium' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{r.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span>{r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}</span>
                        </div>
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
      </div>

      <Footer />
    </main>
  );
}
