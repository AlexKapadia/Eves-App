import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Instagram, Facebook, Twitter, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-hiking-night text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-2xl font-bold">OutdoorWomen United</h3>
            <p className="text-hiking-stone max-w-sm">
              Empowering women around the world through outdoor activities, adventure, 
              and connection with nature.
            </p>
            <div className="flex space-x-4 pt-2">
              <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-hiking-sand">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-hiking-stone hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-hiking-stone hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-hiking-stone hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-hiking-stone hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-hiking-stone hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-hiking-sand">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/safety" className="text-hiking-stone hover:text-white transition-colors">
                  Outdoor Safety
                </Link>
              </li>
              <li>
                <Link to="/gear-guides" className="text-hiking-stone hover:text-white transition-colors">
                  Gear Guides
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-hiking-stone hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-hiking-stone hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-hiking-stone hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-hiking-sand">
              Join Our Community
            </h4>
            <p className="text-hiking-stone mb-4">
              Subscribe to our newsletter for latest events, products, and outdoor activity tips.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-hiking-terracotta flex-grow"
                required
              />
              <Button variant="terracotta" size="default" className="flex-shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-hiking-stone">
            &copy; {new Date().getFullYear()} OutdoorWomen United. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-hiking-stone hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-hiking-stone hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/accessibility" className="text-sm text-hiking-stone hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-hiking-stone">
          <p className="flex items-center justify-center">
            Made with <Heart className="h-4 w-4 mx-1 text-hiking-terracotta" /> for adventurous souls
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
