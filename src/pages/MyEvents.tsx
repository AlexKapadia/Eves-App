
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MyEvents = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">My Events</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">You haven't registered for any events yet.</p>
            <div className="grid gap-6">
              {/* Events will be displayed here */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <p className="text-hiking-moss font-semibold">No upcoming events</p>
                <p className="text-gray-600">Check out our events page to find your next hiking adventure!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyEvents;
