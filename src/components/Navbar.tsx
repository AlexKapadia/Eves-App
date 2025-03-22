import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Menu, X, User, ShoppingBag, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Community', path: '/community' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className={cn(
              "text-2xl font-bold transition-colors duration-300",
              isScrolled ? "text-hiking-night" : "text-white text-shadow"
            )}
          >
            OutdoorWomen United
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                  isScrolled
                    ? 'text-hiking-night hover:text-hiking-moss'
                    : 'text-white text-shadow hover:text-hiking-sand',
                  location.pathname === link.path && 'font-semibold',
                  location.pathname === link.path && (isScrolled ? 'text-hiking-moss' : 'text-hiking-sand')
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Profile">
                    <Avatar className="h-8 w-8">
                      {user?.profileImage ? (
                        <AvatarImage src={user.profileImage} />
                      ) : (
                        <AvatarFallback className={cn(isScrolled ? "bg-hiking-moss text-white" : "bg-white/20 text-white")}>
                          {user?.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/my-events" className="w-full">My Events</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/saved-trails" className="w-full">Saved Trails</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant={isScrolled ? 'outline' : 'ghost'} 
                  size="sm"
                  className={cn(!isScrolled && 'text-white')}
                  onClick={() => navigate('/sign-in')}
                >
                  Sign In
                </Button>
                <Button 
                  variant={isScrolled ? 'default' : 'outline'} 
                  size="sm"
                  className={cn(!isScrolled && 'border-white text-white hover:bg-white/20')}
                  onClick={() => navigate('/sign-up')}
                >
                  Sign Up
                </Button>
              </>
            )}
            
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingBag className={cn('h-5 w-5', isScrolled ? 'text-hiking-night' : 'text-white')} />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className={cn('h-6 w-6', isScrolled ? 'text-hiking-night' : 'text-white')} />
            ) : (
              <Menu className={cn('h-6 w-6', isScrolled ? 'text-hiking-night' : 'text-white')} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
            isOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col space-y-1 bg-white/90 backdrop-blur-md rounded-lg p-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  'text-hiking-night hover:text-hiking-moss hover:bg-hiking-moss/10',
                  location.pathname === link.path && 'font-semibold text-hiking-moss bg-hiking-moss/5'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-hiking-night"
                    onClick={() => navigate('/profile')}
                  >
                    My Profile
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-hiking-night"
                    onClick={() => navigate('/sign-in')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/sign-up')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
