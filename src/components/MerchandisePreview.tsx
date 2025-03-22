
import { Button } from './Button';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const products = [
  {
    id: 1,
    name: "Alpine Trail Jacket",
    category: "Outerwear",
    price: 189.99,
    image: "https://images.unsplash.com/photo-1522962222687-d57a3bf5d44b?q=80&w=1374&auto=format&fit=crop",
    colors: ["Sage", "Terracotta", "Black"],
    bestseller: true
  },
  {
    id: 2,
    name: "Adventure Hiking Pants",
    category: "Bottoms",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=1479&auto=format&fit=crop",
    colors: ["Khaki", "Black", "Navy"],
  },
  {
    id: 3,
    name: "Summit Daypack",
    category: "Accessories",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1470&auto=format&fit=crop",
    colors: ["Moss", "Sky", "Terracotta"],
    new: true
  },
  {
    id: 4,
    name: "Trail Runner Socks",
    category: "Accessories",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1374&auto=format&fit=crop",
    colors: ["Mixed Pack"],
  }
];

const MerchandisePreview = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-hiking-night font-bold mb-4">Shop Our Collection</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Premium hiking apparel and gear designed specifically for women by women.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <div 
              key={product.id}
              className={cn(
                "group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all",
                "opacity-0 animate-fade-in",
                idx === 0 ? "animate-delay-100" : 
                idx === 1 ? "animate-delay-200" : 
                idx === 2 ? "animate-delay-300" : "animate-delay-400"
              )}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Product Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.bestseller && (
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-hiking-terracotta text-white">
                      Bestseller
                    </span>
                  )}
                  {product.new && (
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-hiking-sky text-white">
                      New
                    </span>
                  )}
                </div>
                
                {/* Quick Add Button */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/80 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button variant="default" size="sm" className="w-full flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Quick Add
                  </Button>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-hiking-night">{product.name}</h3>
                  <span className="text-hiking-moss font-medium">${product.price}</span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                
                {/* Color Options */}
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Colors:</span>
                  <div className="flex space-x-1">
                    {product.colors.map((color, i) => (
                      <span key={i} className="text-xs text-gray-600">
                        {color}{i < product.colors.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Product Categories */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative rounded-xl overflow-hidden h-80 hover-lift">
            <img 
              src="https://images.unsplash.com/photo-1580274455191-1c62238fa333?q=80&w=1364&auto=format&fit=crop" 
              alt="Apparel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hiking-night/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Apparel</h3>
              <Button variant="terracotta" size="sm">
                Shop Collection
              </Button>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden h-80 hover-lift">
            <img 
              src="https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1470&auto=format&fit=crop" 
              alt="Footwear"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hiking-night/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Footwear</h3>
              <Button variant="terracotta" size="sm">
                Shop Collection
              </Button>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden h-80 hover-lift">
            <img 
              src="https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=1471&auto=format&fit=crop" 
              alt="Gear & Accessories"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hiking-night/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Gear & Accessories</h3>
              <Button variant="terracotta" size="sm">
                Shop Collection
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Button variant="default" size="lg" className="group">
            Visit Shop <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MerchandisePreview;
