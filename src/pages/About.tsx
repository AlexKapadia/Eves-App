
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-hiking-meadow/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-hiking-night mb-6">About Us</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Learn about our mission to empower women through hiking and outdoor adventures.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="text-center text-hiking-meadow text-lg">About page content coming soon!</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
