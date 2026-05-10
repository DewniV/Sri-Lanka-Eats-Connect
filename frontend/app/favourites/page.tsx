'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Heart } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';

export const dynamic = 'force-dynamic';

interface Restaurant {
  _id: string;
  name: string;
  city: string;
  cuisineType: string;
  priceRange: string;
  coverImage: string;
  averageRating: number;
  totalReviews: number;
  description: string;
}

const PRICE_DISPLAY: Record<string, string> = {
  budget: '$',
  mid: '$$',
  upscale: '$$$',
  fine: '$$$$',
};

const STORAGE_KEY = 'sl_eats_favourites';

function getFavouriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function FavouritesPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('sl_eats_user') || 'null');
    if (!user) {
      router.push('/login');
      return;
    }
    loadFavourites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFavourites = async () => {
    setLoading(true);
    const ids = getFavouriteIds();
    if (ids.length === 0) {
      setRestaurants([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch all restaurants and filter client-side by saved IDs
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants`);
      const data = await res.json();
      const list: Restaurant[] = Array.isArray(data) ? data : (data.restaurants || []);
      setRestaurants(list.filter(r => ids.includes(r._id)));
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavourite = (id: string) => {
    const updated = getFavouriteIds().filter(fid => fid !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRestaurants(prev => prev.filter(r => r._id !== id));
  };

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Favourites</h1>
          <p className="text-muted-foreground mt-1">Restaurants you've saved for later.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favourites yet</h2>
            <p className="text-muted-foreground mb-6">Browse restaurants and tap the heart icon to save your favourites here.</p>
            <Link
              href="/restaurants"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(restaurant => (
              <div key={restaurant._id} className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={restaurant.coverImage || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=300&fit=crop'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => removeFavourite(restaurant._id)}
                    title="Remove from favourites"
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:scale-110 transition-transform"
                  >
                    <Heart size={18} className="fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-foreground text-lg leading-tight">{restaurant.name}</h3>
                    <span className="text-muted-foreground text-sm ml-2 shrink-0">{PRICE_DISPLAY[restaurant.priceRange] || '$$'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin size={13} className="shrink-0" />
                    <span>{restaurant.city}</span>
                    <span>·</span>
                    <span>{restaurant.cuisineType}</span>
                  </div>
                  {restaurant.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-sm mb-3">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="font-medium">{Number(restaurant.averageRating).toFixed(1)}</span>
                      <span className="text-muted-foreground">({restaurant.totalReviews})</span>
                    </div>
                  )}
                  <Link
                    href={`/restaurants/${restaurant._id}`}
                    className="block w-full text-center py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
