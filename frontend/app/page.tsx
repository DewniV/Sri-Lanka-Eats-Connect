import Navigation from '@/components/navigation';
import Hero from '@/components/hero';
import HowItWorks from '@/components/how-it-works';
import FeaturedRestaurants from '@/components/featured-restaurants';
import { EatsPoints } from '@/components/eats-points';
import { FAQ } from '@/components/faq';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <HowItWorks />
      <FeaturedRestaurants />
      <EatsPoints />
      <FAQ />
      <Footer />
    </main>
  );
}
