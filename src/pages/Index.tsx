
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturedEvents from '@/components/FeaturedEvents';
import CommunityHighlights from '@/components/CommunityHighlights';
import MerchandisePreview from '@/components/MerchandisePreview';
import Newsletter from '@/components/Newsletter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedEvents />
        <CommunityHighlights />
        <MerchandisePreview />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
