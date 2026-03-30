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
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Open/Closed Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
          isOpen ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
        }`}>
          {isOpen ? 'Open Now' : 'Closed'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Restaurant Name */}
        <h3 className="text-lg font-bold text-foreground mb-2">{name}</h3>

        {/* Cuisine Badge */}
        <div className="mb-3">
          <span className="inline-block bg-secondary text-foreground px-3 py-1 rounded-full text-xs font-medium">
            {cuisine}
          </span>
        </div>

        {/* City */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin size={14} />
          <span>{city}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(rating)
                    ? 'fill-primary text-primary'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
        </div>

        {/* Price Range */}
        <p className="text-sm text-muted-foreground mb-4">Price: {priceRange}</p>

        {/* View Restaurant Button */}
        <Link
          href={`/restaurants/${id}`}
          className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}
