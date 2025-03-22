
import { Button } from './Button';
import { ArrowRight, Calendar, MapPin, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const events = [
  {
    id: 1,
    title: "Alpine Lake Summit Hike",
    image: "https://images.unsplash.com/photo-1454982523318-4b6396f39d3a?q=80&w=1470&auto=format&fit=crop",
    date: "June 15, 2024",
    location: "Rocky Mountain National Park, CO",
    difficulty: "Moderate",
    duration: "6 hours",
    description: "A beautiful hike to a pristine alpine lake with stunning mountain views.",
    attendees: 12
  },
  {
    id: 2,
    title: "Coastal Sunset Trail",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1452&auto=format&fit=crop",
    date: "July 8, 2024",
    location: "Big Sur, CA",
    difficulty: "Easy",
    duration: "3 hours",
    description: "Enjoy breathtaking ocean views while hiking along the California coast.",
    attendees: 20
  },
  {
    id: 3,
    title: "Desert Wildflower Exploration",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1421&auto=format&fit=crop",
    date: "April 22, 2024",
    location: "Joshua Tree National Park, CA",
    difficulty: "Easy-Moderate",
    duration: "4 hours",
    description: "Witness the stunning desert wildflower bloom while learning about desert ecology.",
    attendees: 15
  }
];

const FeaturedEvents = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-hiking-night font-bold mb-4">Upcoming Adventures</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Join our community for these exciting hiking events designed for women of all skill levels.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <div 
              key={event.id}
              className={cn(
                "bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow",
                "opacity-0 animate-fade-in",
                idx === 0 ? "animate-delay-100" : idx === 1 ? "animate-delay-200" : "animate-delay-300"
              )}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "inline-block px-3 py-1 text-xs font-medium rounded-full text-white",
                    event.difficulty === "Easy" ? "bg-hiking-meadow" :
                    event.difficulty === "Moderate" ? "bg-hiking-terracotta" : "bg-hiking-night"
                  )}>
                    {event.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-hiking-night mb-2">{event.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-hiking-moss" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-hiking-moss" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-hiking-moss" />
                    <span className="text-sm">{event.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 text-hiking-moss" />
                    <span className="text-sm">{event.attendees} attendees</span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 text-sm">{event.description}</p>
                
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="default" size="lg" className="group">
            View All Events <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
