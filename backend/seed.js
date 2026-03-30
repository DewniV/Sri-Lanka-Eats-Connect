require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

const MONGO_URI = process.env.MONGO_URI;

const restaurants = [
  {
    name: 'Ministry of Crab',
    description: 'Award-winning seafood restaurant located in the historic Dutch Hospital Shopping Precinct in Colombo. Famous for its giant Sri Lankan mud crabs cooked in a variety of styles.',
    address: 'Dutch Hospital Shopping Precinct, Hospital Street, Colombo 01',
    city: 'Colombo',
    phone: '+94 11 234 2722',
    email: 'info@ministryofcrab.com',
    cuisineType: 'Seafood',
    priceRange: 'fine',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    averageRating: 4.8,
    totalReviews: 256,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '12:00-22:30', tue: '12:00-22:30', wed: '12:00-22:30', thu: '12:00-22:30', fri: '12:00-23:00', sat: '12:00-23:00', sun: '12:00-22:30' }
  },
  {
    name: 'Nuga Gama',
    description: 'A traditional Sri Lankan village-themed restaurant inside the Cinnamon Grand Hotel. Offers authentic rice and curry buffets served on banana leaves in a beautiful outdoor setting.',
    address: 'Cinnamon Grand Hotel, 77 Galle Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 249 7777',
    email: 'nugagama@cinnamonhotels.com',
    cuisineType: 'Sri Lankan',
    priceRange: 'upscale',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
    averageRating: 4.6,
    totalReviews: 189,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '19:00-22:30', tue: '19:00-22:30', wed: '19:00-22:30', thu: '19:00-22:30', fri: '19:00-23:00', sat: '12:00-15:00,19:00-23:00', sun: '12:00-15:00,19:00-22:30' }
  },
  {
    name: 'Palmyrah Restaurant',
    description: 'Specialising in authentic Jaffna Tamil cuisine, Palmyrah is one of the few restaurants in Colombo offering traditional Northern Sri Lankan dishes including Jaffna crab curry and mutton rolls.',
    address: 'Renuka City Hotel, 328 Galle Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 257 3598',
    email: 'info@palmyrahrestaurant.lk',
    cuisineType: 'Jaffna Cuisine',
    priceRange: 'mid',
    coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
    averageRating: 4.5,
    totalReviews: 143,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '11:00-22:00', tue: '11:00-22:00', wed: '11:00-22:00', thu: '11:00-22:00', fri: '11:00-22:30', sat: '11:00-22:30', sun: '11:00-22:00' }
  },
  {
    name: 'The Gallery Café',
    description: 'Set in a stunning colonial building designed by Geoffrey Bawa, The Gallery Café offers a fusion menu combining Sri Lankan and international flavours in a beautifully curated art gallery setting.',
    address: '2 Alfred House Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 258 2162',
    email: 'info@gallerycafe.lk',
    cuisineType: 'Fusion',
    priceRange: 'upscale',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    averageRating: 4.7,
    totalReviews: 312,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '11:00-23:00', tue: '11:00-23:00', wed: '11:00-23:00', thu: '11:00-23:00', fri: '11:00-23:30', sat: '11:00-23:30', sun: '11:00-23:00' }
  },
  {
    name: 'Hotel de Pilawoos',
    description: 'A Colombo institution since 1962, Pilawoos is famous for its kottu roti and late-night street food culture. A must-visit for an authentic local dining experience.',
    address: '417 Galle Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 236 5871',
    email: 'info@pilawoos.lk',
    cuisineType: 'Sri Lankan',
    priceRange: 'budget',
    coverImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop',
    averageRating: 4.4,
    totalReviews: 521,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '06:00-02:00', tue: '06:00-02:00', wed: '06:00-02:00', thu: '06:00-02:00', fri: '06:00-03:00', sat: '06:00-03:00', sun: '06:00-02:00' }
  },
  {
    name: 'Saffron',
    description: 'An elegant Indian restaurant in Kandy offering rich Mughlai and South Indian cuisine. Known for its aromatic biryanis, butter chicken, and traditional tandoor dishes.',
    address: '16 Dalada Veediya, Kandy',
    city: 'Kandy',
    phone: '+94 81 222 4444',
    email: 'saffron@kandyeats.lk',
    cuisineType: 'Indian',
    priceRange: 'mid',
    coverImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
    averageRating: 4.3,
    totalReviews: 98,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '11:00-22:00', tue: '11:00-22:00', wed: '11:00-22:00', thu: '11:00-22:00', fri: '11:00-22:30', sat: '11:00-22:30', sun: '11:00-22:00' }
  },
  {
    name: 'Pedlar\'s Inn Café',
    description: 'A charming café in the heart of Galle Fort offering Sri Lankan breakfast, fresh seafood and Western dishes. Popular with tourists and locals alike for its relaxed atmosphere.',
    address: '92 Pedlar Street, Galle Fort, Galle',
    city: 'Galle',
    phone: '+94 91 222 2138',
    email: 'info@pedlarsinn.lk',
    cuisineType: 'Café',
    priceRange: 'mid',
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
    averageRating: 4.5,
    totalReviews: 167,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '08:00-21:00', tue: '08:00-21:00', wed: '08:00-21:00', thu: '08:00-21:00', fri: '08:00-21:30', sat: '08:00-21:30', sun: '08:00-21:00' }
  },
  {
    name: 'Lords Restaurant',
    description: 'A popular seafood and Sri Lankan cuisine restaurant in Negombo, known for its fresh catch of the day, prawn dishes and relaxed beachside atmosphere.',
    address: '2 Carron Place, Negombo',
    city: 'Negombo',
    phone: '+94 31 222 3364',
    email: 'lords@negomboeats.lk',
    cuisineType: 'Seafood',
    priceRange: 'mid',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    averageRating: 4.2,
    totalReviews: 134,
    isActive: true,
    isVerified: false,
    openingHours: { mon: '11:00-22:00', tue: '11:00-22:00', wed: '11:00-22:00', thu: '11:00-22:00', fri: '11:00-22:30', sat: '11:00-22:30', sun: '11:00-22:00' }
  },
  {
    name: 'Upali\'s by Nawaloka',
    description: 'One of Colombo\'s most beloved traditional Sri Lankan restaurants, Upali\'s has been serving authentic rice and curry, hoppers, and string hoppers since 1983.',
    address: '65 C.W.W. Kannangara Mawatha, Colombo 07',
    city: 'Colombo',
    phone: '+94 11 269 5646',
    email: 'upalis@nawaloka.lk',
    cuisineType: 'Sri Lankan',
    priceRange: 'budget',
    coverImage: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop',
    averageRating: 4.3,
    totalReviews: 445,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '07:00-22:00', tue: '07:00-22:00', wed: '07:00-22:00', thu: '07:00-22:00', fri: '07:00-22:30', sat: '07:00-22:30', sun: '07:00-22:00' }
  },
  {
    name: 'Harbour Room',
    description: 'A fine dining restaurant at the Galle Face Hotel offering panoramic views of the Indian Ocean. Specialises in premium Sri Lankan seafood and international cuisine.',
    address: 'Galle Face Hotel, 2 Kollupitiya Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 254 1010',
    email: 'harbourroom@gallefacehotel.com',
    cuisineType: 'Fine Dining',
    priceRange: 'fine',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    averageRating: 4.6,
    totalReviews: 203,
    isActive: true,
    isVerified: true,
    openingHours: { mon: '12:00-15:00,19:00-23:00', tue: '12:00-15:00,19:00-23:00', wed: '12:00-15:00,19:00-23:00', thu: '12:00-15:00,19:00-23:00', fri: '12:00-15:00,19:00-23:30', sat: '12:00-15:00,19:00-23:30', sun: '12:00-15:00,19:00-23:00' }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing data
    await Restaurant.deleteMany({});
    await User.deleteMany({ email: 'seedowner@sleats.lk' });
    console.log('Cleared existing seed data');

    // Create a seed vendor user to be the owner of all restaurants
    const hashedPassword = await bcrypt.hash('SeedOwner2024!', 10);
    const owner = await User.create({
      name: 'SL Eats Admin',
      email: 'seedowner@sleats.lk',
      password: hashedPassword,
      role: 'vendor'
    });
    console.log('Created seed owner user:', owner._id);

    // Insert all restaurants with the owner reference
    const restaurantsWithOwner = restaurants.map(r => ({ ...r, owner: owner._id }));
    const inserted = await Restaurant.insertMany(restaurantsWithOwner);
    console.log(`Successfully seeded ${inserted.length} restaurants!`);

    inserted.forEach(r => console.log(`  - ${r.name} (${r.city})`));

    await mongoose.disconnect();
    console.log('\nDone! MongoDB disconnected.');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
