
import { Button } from './Button';
import { ArrowRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    quote: "OutdoorWomen United helped me find a community of like-minded women who share my passion for outdoor adventures. I've made lifelong friends and discovered incredible experiences I never would have known about!",
    name: "Sarah J.",
    location: "Denver, CO",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1522&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "As a solo female traveler, finding safe outdoor groups was always a challenge. This community has been a game changer for me - I can now explore confidently with amazing women wherever I go.",
    name: "Mei L.",
    location: "Vancouver, BC",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: 3,
    quote: "The apparel is not only stylish but perfectly designed for women's bodies. The outdoor gear actually has functional pockets! It's refreshing to find equipment that's both practical and beautiful.",
    name: "Alexis T.",
    location: "Portland, OR",
    image: "https://images.unsplash.com/photo-1528892952291-009c663ce843?q=80&w=1144&auto=format&fit=crop"
  }
];

const CommunityHighlights = () => {
  return (
    <section className="py-20 bg-hiking-sage/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-hiking-night font-bold mb-4">Our Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Hear from the women who've found connection, confidence, and adventure
            through OutdoorWomen United.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={testimonial.id}
              className={cn(
                "bg-white rounded-xl shadow-sm p-6 border border-gray-100",
                "opacity-0 animate-fade-in",
                idx === 0 ? "animate-delay-100" : idx === 1 ? "animate-delay-300" : "animate-delay-500"
              )}
            >
              <div className="mb-6">
                <Quote className="h-10 w-10 text-hiking-sage opacity-20" />
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-hiking-night">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Community Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-6 bg-hiking-moss/10 rounded-xl">
            <div className="text-4xl font-bold text-hiking-moss mb-2">10,000+</div>
            <div className="text-gray-600">Active Members</div>
          </div>
          <div className="p-6 bg-hiking-terracotta/10 rounded-xl">
            <div className="text-4xl font-bold text-hiking-terracotta mb-2">50+</div>
            <div className="text-gray-600">Countries</div>
          </div>
          <div className="p-6 bg-hiking-sky/10 rounded-xl">
            <div className="text-4xl font-bold text-hiking-sky mb-2">500+</div>
            <div className="text-gray-600">Monthly Events</div>
          </div>
          <div className="p-6 bg-hiking-meadow/10 rounded-xl">
            <div className="text-4xl font-bold text-hiking-meadow mb-2">2,500+</div>
            <div className="text-gray-600">Adventure Reports</div>
          </div>
        </div>
        
        {/* Join Community CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-4">Become Part of Our Community</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Connect with women outdoor enthusiasts worldwide, share your adventures, and find your next activity partner.
          </p>
          <Button variant="default" size="lg" className="group">
            Join Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommunityHighlights;
