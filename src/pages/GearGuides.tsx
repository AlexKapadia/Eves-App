
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Mountain, ThermometerSun, Backpack } from 'lucide-react';

const GearGuides = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-hiking-sage/10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-hiking-night mb-6">Outdoor Gear Guides</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Expert recommendations for women's outdoor gear, clothing, and equipment to make your adventures safe and enjoyable.
            </p>
          </div>
        </section>
        
        <section className="py-16 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="bg-hiking-terracotta/10 p-8 flex items-center">
                <div className="bg-hiking-terracotta rounded-full p-3 mr-4">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-hiking-night">Essential Gear for Beginners</h2>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-gray-600 mb-4">
                  Starting your outdoor journey? Learn about the essential items every woman should have in her backpack, from proper footwear to hydration solutions.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Hiking boots vs. trail runners: what's right for you</li>
                  <li>• Backpack sizing and fit guide for women</li>
                  <li>• Hydration systems comparison</li>
                  <li>• First-aid essentials for outdoor activities</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="bg-hiking-sky/10 p-8 flex items-center">
                <div className="bg-hiking-sky rounded-full p-3 mr-4">
                  <Mountain className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-hiking-night">Seasonal Apparel Guide</h2>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-gray-600 mb-4">
                  Discover the best clothing options for each season and activity, with a focus on women-specific designs that offer both function and style.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Layering techniques for changing weather</li>
                  <li>• Women's outdoor pants and shorts comparison</li>
                  <li>• Sports bras designed for outdoor comfort</li>
                  <li>• Weather protection gear that actually performs</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="bg-hiking-moss/10 p-8 flex items-center">
                <div className="bg-hiking-moss rounded-full p-3 mr-4">
                  <ThermometerSun className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-hiking-night">Tech & Gadgets</h2>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-gray-600 mb-4">
                  From GPS devices to solar chargers, explore the technology that can enhance safety and enjoyment on your outdoor adventures.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Trail navigation apps and devices</li>
                  <li>• Solar chargers and power banks</li>
                  <li>• Fitness trackers for outdoor enthusiasts</li>
                  <li>• Emergency communication devices</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="bg-hiking-meadow/10 p-8 flex items-center">
                <div className="bg-hiking-meadow rounded-full p-3 mr-4">
                  <Backpack className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-hiking-night">Multi-Day Adventure Essentials</h2>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-gray-600 mb-4">
                  Planning an overnight adventure? Find comprehensive guides on camping gear, cooking equipment, and backpacking essentials.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Lightweight tents and shelters</li>
                  <li>• Women-specific sleeping bags and pads</li>
                  <li>• Compact cooking systems</li>
                  <li>• Multi-day trip food planning</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 italic">
              More detailed gear guides coming soon! Check back weekly for new content.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GearGuides;
