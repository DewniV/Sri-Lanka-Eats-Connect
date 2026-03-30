'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Phone, Mail, Clock, ChevronLeft, Users } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

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
  coverImage: string;
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  openingHours: Record<string, string>;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

const PRICE_DISPLAY: Record<string, string> = {
  budget: '$',
  mid: '$$',
  upscale: '$$$',
  fine: '$$$$',
};

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reservation form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: '2',
    reservationDate: '',
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (id) fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/restaurants/${id}`);
      if (!response.ok) throw new Error('Restaurant not found');
      const data = await response.json();
      setRestaurant(data.restaurant);
      setMenu(data.menu || []);
    } catch (err) {
      setError('Could not load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingError('');

    try {
      // Get logged-in user from localStorage if available
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const payload = {
        restaurant: id,
        customer: user?._id || undefined,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        partySize: parseInt(formData.partySize),
        reservationDate: new Date(formData.reservationDate).toISOString(),
        specialRequests: formData.specialRequests,
        source: 'web',
        language: 'en',
      };

      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Booking failed');

      setBookingSuccess(true);
      setShowForm(false);
      setFormData({ customerName: '', customerEmail: '', customerPhone: '', partySize: '2', reservationDate: '', specialRequests: '' });
    } catch (err: any) {
      setBookingError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get tomorrow's date as minimum for reservation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-lg text-red-500">{error || 'Restaurant not found'}</p>
          <Link href="/restaurants" className="text-primary hover:underline">← Back to restaurants</Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-16">
        {/* Hero Image */}
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          <img
            src={restaurant.coverImage || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=500&fit=crop'}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-6 left-6 right-6">
            <Link href="/restaurants" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors">
              <ChevronLeft size={16} /> Back to restaurants
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{restaurant.name}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">{restaurant.cuisineType}</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">{PRICE_DISPLAY[restaurant.priceRange] || '$$'}</span>
              {restaurant.isActive && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">Open Now</span>
              )}
              {restaurant.isVerified && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left column — details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className={i < Math.floor(restaurant.averageRating) ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                  ))}
                </div>
                <span className="text-lg font-bold">{restaurant.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({restaurant.totalReviews} reviews)</span>
              </div>

              {/* Description */}
              {restaurant.description && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
                </div>
              )}

              {/* Contact info */}
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Contact & Location</h2>
                <div className="space-y-3">
                  {restaurant.address && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin size={18} className="mt-0.5 text-primary shrink-0" />
                      <span>{restaurant.address}, {restaurant.city}</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone size={18} className="text-primary shrink-0" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail size={18} className="text-primary shrink-0" />
                      <span>{restaurant.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Menu */}
              {menu.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Menu</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {menu.map(item => (
                      <div key={item._id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <span className="text-primary font-bold ml-2">LKR {item.price.toLocaleString()}</span>
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                        <span className="inline-block mt-2 text-xs bg-secondary px-2 py-0.5 rounded-full">{item.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — booking */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-2">Make a Reservation</h2>
                <p className="text-sm text-muted-foreground mb-5">Book your table at {restaurant.name}</p>

                {/* Success message */}
                {bookingSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    🎉 Your reservation has been submitted! The restaurant will confirm shortly.
                  </div>
                )}

                {!showForm && !bookingSuccess && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Reserve a Table
                  </button>
                )}

                {bookingSuccess && (
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="w-full py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition"
                  >
                    Make Another Reservation
                  </button>
                )}

                {showForm && (
                  <form onSubmit={handleReservationSubmit} className="space-y-4">
                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {bookingError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Your name *</label>
                      <input
                        name="customerName"
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={handleFormChange}
                        placeholder="Full name"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                      <input
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleFormChange}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                      <input
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleFormChange}
                        placeholder="+94 77 123 4567"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        <span className="flex items-center gap-1"><Users size={14} /> Party size *</span>
                      </label>
                      <select
                        name="partySize"
                        required
                        value={formData.partySize}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        <span className="flex items-center gap-1"><Clock size={14} /> Date & time *</span>
                      </label>
                      <input
                        name="reservationDate"
                        type="datetime-local"
                        required
                        min={minDate}
                        value={formData.reservationDate}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Special requests</label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleFormChange}
                        placeholder="Allergies, dietary requirements, occasion..."
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                      >
                        {submitting ? 'Booking...' : 'Confirm'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
