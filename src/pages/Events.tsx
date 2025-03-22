import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';

// Event card component
interface EventProps {
  title: string;
  date: string;
  location: string;
  image: string;
  distance: string;
  difficulty: string;
  spots: number;
  price: string;
}

const EventCard: React.FC<EventProps> = ({ 
  title, date, location, image, distance, difficulty, spots, price 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-4px]">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-hiking-night">
          {price}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-hiking-night mb-2">{title}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="bg-hiking-sky/10 text-hiking-sky px-2 py-1 rounded-full">
            {distance}
          </span>
          <span className={`px-2 py-1 rounded-full ${
            difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
            difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {difficulty}
          </span>
          <span className="bg-hiking-stone/10 text-hiking-night px-2 py-1 rounded-full flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {spots} spots
          </span>
        </div>
        <button className="w-full bg-hiking-moss text-white py-2 rounded-lg hover:bg-hiking-moss/90 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
};

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  // Mock events data
  const events = [
    {
      id: 1,
      title: "Mount Rainier Wildflower Hike",
      date: "July 15, 2023 • 8:00 AM",
      location: "Mount Rainier National Park, WA",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop",
      distance: "8 miles",
      difficulty: "Moderate",
      spots: 12,
      price: "Free"
    },
    {
      id: 2,
      title: "Sedona Red Rock Canyon Tour",
      date: "August 5, 2023 • 7:30 AM",
      location: "Sedona, AZ",
      image: "https://images.unsplash.com/photo-1588392382834-a891154bca4d?q=80&w=1476&auto=format&fit=crop",
      distance: "6 miles",
      difficulty: "Easy",
      spots: 15,
      price: "$45"
    },
    {
      id: 3,
      title: "Appalachian Trail Weekend",
      date: "September 18-20, 2023",
      location: "Great Smoky Mountains, TN",
      image: "https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=1473&auto=format&fit=crop",
      distance: "22 miles",
      difficulty: "Difficult",
      spots: 8,
      price: "$120"
    },
    {
      id: 4,
      title: "Coastal Sunset Hike",
      date: "July 22, 2023 • 6:00 PM",
      location: "Point Reyes, CA",
      image: "https://images.unsplash.com/photo-1471078222230-1a910e8bfc53?q=80&w=1473&auto=format&fit=crop",
      distance: "4 miles",
      difficulty: "Easy",
      spots: 20,
      price: "$15"
    },
    {
      id: 5,
      title: "Alpine Lake Trail Adventure",
      date: "August 12, 2023 • 7:00 AM",
      location: "Rocky Mountain National Park, CO",
      image: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?q=80&w=1374&auto=format&fit=crop",
      distance: "10 miles",
      difficulty: "Moderate",
      spots: 10,
      price: "$25"
    },
    {
      id: 6,
      title: "Desert Canyon Exploration",
      date: "October 8, 2023 • 8:30 AM",
      location: "Moab, UT",
      image: "https://images.unsplash.com/photo-1543837173-496f2e2e99f5?q=80&w=1374&auto=format&fit=crop",
      distance: "7 miles",
      difficulty: "Moderate",
      spots: 14,
      price: "$35"
    }
  ];
  
  // Filter events by search term and difficulty
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || event.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-hiking-moss/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-hiking-night mb-6">Upcoming Events</h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Join our community for hiking adventures around the world. Find the perfect event for your skill level.
            </p>
            
            {/* Search bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events by name or location..."
                  className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-hiking-moss focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between mb-8">
              <div className="flex items-center mb-4 md:mb-0">
                <Filter className="h-5 w-5 mr-2 text-hiking-night" />
                <span className="font-medium text-hiking-night mr-4">Filter by:</span>
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDifficulty === 'All' 
                        ? 'bg-hiking-moss text-white' 
                        : 'bg-white text-hiking-night hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDifficulty('All')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDifficulty === 'Easy' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setSelectedDifficulty('Easy')}
                  >
                    Easy
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDifficulty === 'Moderate' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-white text-yellow-700 hover:bg-yellow-50'
                    }`}
                    onClick={() => setSelectedDifficulty('Moderate')}
                  >
                    Moderate
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDifficulty === 'Difficult' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-white text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => setSelectedDifficulty('Difficult')}
                  >
                    Difficult
                  </button>
                </div>
              </div>
              <div>
                <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-hiking-night focus:outline-none focus:ring-2 focus:ring-hiking-moss">
                  <option>Sort by: Upcoming</option>
                  <option>Sort by: Price: Low to High</option>
                  <option>Sort by: Price: High to Low</option>
                  <option>Sort by: Distance</option>
                </select>
              </div>
            </div>
            
            {/* Events grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard 
                    key={event.id}
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    image={event.image}
                    distance={event.distance}
                    difficulty={event.difficulty}
                    spots={event.spots}
                    price={event.price}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-hiking-night text-xl mb-2">No events found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
            
            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 rounded bg-hiking-moss text-white">1</button>
                <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">2</button>
                <button className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">3</button>
                <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">Next</button>
              </nav>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
