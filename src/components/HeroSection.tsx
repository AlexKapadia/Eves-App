
import { Button } from './Button';
import { ArrowRight, MapPin, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-hiking-night/70">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop')",
            backgroundPosition: "center", 
            backgroundSize: "cover",
            mixBlendMode: "overlay"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-hiking-night/30 via-hiking-night/20 to-hiking-night"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div>
              <span className="inline-block bg-hiking-terracotta/90 text-white px-4 py-1 rounded-full text-sm font-medium mb-6">
                Global Outdoor Community for Women
              </span>
              <h1 className="text-white leading-tight font-bold text-balance">
                Explore. Connect.<br />
                <span className="text-hiking-sage">Empower.</span>
              </h1>
              <p className="mt-6 text-white/80 text-lg md:text-xl max-w-md text-balance">
                Join a worldwide community of women who explore the outdoors, share adventures, and inspire each other.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="default" className="group" asChild>
                <Link to="/community">
                  Join Us <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/events">
                  Find Events
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-5 pt-4">
              <div className="flex items-center text-white/80">
                <Users className="h-5 w-5 mr-2 text-hiking-sky" />
                <span>10,000+ Members</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin className="h-5 w-5 mr-2 text-hiking-sky" />
                <span>50+ Countries</span>
              </div>
              <div className="flex items-center text-white/80">
                <Calendar className="h-5 w-5 mr-2 text-hiking-sky" />
                <span>Weekly Events</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="relative">
              {/* Glass Card 1 */}
              <div className={cn(
                "glass-card-dark rounded-2xl p-6 max-w-md absolute -top-8 -left-4",
                "opacity-0 animate-fade-in animate-delay-200"
              )}>
                <div className="flex items-center mb-2">
                  <div className="bg-hiking-terracotta rounded-full p-2 mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-white font-medium">Next Event</h3>
                </div>
                <h4 className="text-white text-xl font-medium">Sunset Yoga - Pacific Coast</h4>
                <p className="text-white/70 mt-2">Join 15 participants for a beautiful sunset experience along the coast.</p>
                <Button variant="terracotta" size="sm" className="mt-4" asChild>
                  <Link to="/events">Details</Link>
                </Button>
              </div>
              
              {/* Glass Card 2 */}
              <div className={cn(
                "glass-card-dark rounded-2xl p-6 max-w-md absolute bottom-4 right-0",
                "opacity-0 animate-fade-in animate-delay-400"
              )}>
                <div className="flex items-center mb-2">
                  <div className="bg-hiking-sky rounded-full p-2 mr-3">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-white font-medium">Trending Adventure</h3>
                </div>
                <h4 className="text-white text-xl font-medium">Alpine Lake Loop</h4>
                <div className="flex items-center text-white/70 mt-2">
                  <span className="text-hiking-meadow mr-2">●</span>
                  <span>Moderate • 8.5 miles • 1,200 ft elevation</span>
                </div>
                <Button variant="sky" size="sm" className="mt-4" asChild>
                  <Link to="/gear-guides">View Trail</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Shape Divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none w-full">
        <svg
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          className="relative block h-[60px] w-full"
          fill="#ffffff"
        >
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
