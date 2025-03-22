
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="py-20 bg-hiking-moss text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Community Newsletter</h2>
          <p className="mb-8 text-white/80 text-lg">
            Stay updated with trail recommendations, hiking tips, product launches, and exclusive offers.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-filter backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 text-white placeholder:text-white/60"
              required
            />
            <Button variant="terracotta" size="lg" className="whitespace-nowrap group">
              Subscribe <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/60">
            Join 25,000+ subscribers. We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
