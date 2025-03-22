
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Shop = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-hiking-terracotta/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-hiking-night mb-6">Shop</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our premium collection of hiking apparel and gear designed specifically for women.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-hiking-terracotta text-lg">Shop features coming soon!</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
