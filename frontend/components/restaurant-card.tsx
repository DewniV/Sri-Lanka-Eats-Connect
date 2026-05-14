'use client';
import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  rating: number;
  reviews: number;
  priceRange: string;
  isOpen: boolean;
  image?: string;
}

export function RestaurantCard({
  id,
  name,
  cuisine,
  city,
  rating,
  reviews,
  priceRange,
  isOpen,
  image = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop'
}: RestaurantCardProps) {
  const priceLabel: Record<string, string> = {
    budget: 'LKR < 1,000',
    mid: 'LKR 1,000–5,000',
    upscale: 'LKR 5,000–15,000',
    fine: 'LKR 15,000+',
  };

  return (
    <Link href={`/restaurants/${id}`} className="group block">
      <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(212,175,55,0.15)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,26,16,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
          {/* Open/Closed Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-600/80 text-white'
          }`}>
            {isOpen ? '● Open Now' : '● Closed'}
          </div>
          {/* Cuisine tag on image */}
          <div className="absolute bottom-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
              style={{ background: 'rgba(212,175,55,0.9)', color: '#0f2419' }}>
              {cuisine}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Restaurant Name */}
          <h3 className="text-lg font-bold mb-1 line-clamp-1 transition-colors"
            style={{ color: '#f5f0e8', fontFamily: "'Playfair Display', serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af37')}
            onMouseLeave={e => (e.currentTarget.style.color = '#f5f0e8')}>
            {name}
          </h3>

          {/* City */}
          <div className="flex items-center gap-1 text-sm mb-3" style={{ color: '#a89060' }}>
            <MapPin size={13} style={{ color: '#d4af37' }} />
            <span>{city}</span>
          </div>

          {/* Rating + Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold" style={{ color: '#f5f0e8' }}>{rating.toFixed(1)}</span>
              <span className="text-xs" style={{ color: '#a89060' }}>({reviews})</span>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
              {priceLabel[priceRange] ?? priceRange}
            </span>
          </div>

          {/* View button */}
          <div className="mt-4 w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ background: 'rgba(212,175,55,0.12)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, #d4af37, #f0d060)';
              (e.currentTarget as HTMLDivElement).style.color = '#0f2419';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = 'rgba(212,175,55,0.12)';
              (e.currentTarget as HTMLDivElement).style.color = '#d4af37';
            }}>
            View Restaurant →
          </div>
        </div>
      </div>
    </Link>
  );
}
