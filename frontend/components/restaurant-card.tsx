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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 bg-muted overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Open/Closed Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            isOpen ? 'bg-green-500/90 text-white' : 'bg-gray-500/80 text-white'
          }`}>
            {isOpen ? '● Open Now' : '● Closed'}
          </div>
          {/* Cuisine tag on image */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-semibold">
              {cuisine}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Restaurant Name */}
          <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{name}</h3>

          {/* City */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin size={13} />
            <span>{city}</span>
          </div>

          {/* Rating + Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {priceLabel[priceRange] ?? priceRange}
            </span>
          </div>

          {/* View button */}
          <div className="mt-4 w-full text-center px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            View Restaurant →
          </div>
        </div>
      </div>
    </Link>
  );
}
