
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SavedTrails = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8">Saved Trails</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-6">You haven't saved any trails yet.</p>
            <div className="grid gap-6">
              {/* Saved trails will be displayed here */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <p className="text-hiking-moss font-semibold">No saved trails</p>
                <p className="text-gray-600">Browse our trail guides and save your favorites for later!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedTrails;
