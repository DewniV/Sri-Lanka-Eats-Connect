import { Navigation } from '@/components/navigation';
import { Hero } from '@/components/hero';
import { HowItWorks } from '@/components/how-it-works';
import { FeaturedRestaurants } from '@/components/featured-restaurants';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <HowItWorks />
      <FeaturedRestaurants />
      <Footer />
    </main>
  );
}
