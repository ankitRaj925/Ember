import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu as MenuIcon, X, MapPin, Phone, Instagram, Facebook, Twitter, Utensils, User as UserIcon, LogOut, ChevronRight, LayoutDashboard, Settings } from 'lucide-react';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Booking from './components/Booking';
import Cart from './components/Cart';
import AIChat from './components/AIChat';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import UserProfile from './components/UserProfile';
import { MenuItem, CartItem, User } from './types';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      // Trigger scroll effect earlier for smoother transition
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity: quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0); // Remove items if quantity becomes 0
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.isAdmin) {
      setShowAdminDashboard(true);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Also update in the main users DB so login persists with new details
    const usersDb = JSON.parse(localStorage.getItem('ember_users_db') || '[]');
    const updatedDb = usersDb.map((u: any) => 
      u.email === updatedUser.email ? { ...u, ...updatedUser } : u
    );
    localStorage.setItem('ember_users_db', JSON.stringify(updatedDb));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdminDashboard(false);
    setShowUserProfile(false);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    }
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    // If viewing dashboard or profile, switch back to home first
    if (showAdminDashboard) setShowAdminDashboard(false);
    if (showUserProfile) setShowUserProfile(false);
    
    // Small delay to allow render if switching view
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  if (showAdminDashboard && currentUser?.isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (showUserProfile && currentUser) {
    return <UserProfile user={currentUser} onBack={() => setShowUserProfile(false)} onUpdateUser={handleUpdateUser} />;
  }

  return (
    <div className="min-h-screen bg-brand-900 text-brand-50 flex flex-col font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out border-none ${
          isScrolled 
            ? 'bg-brand-950/95 py-3 shadow-xl backdrop-blur-md' 
            : 'bg-transparent py-6 lg:py-8 bg-gradient-to-b from-black/80 to-transparent shadow-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => { setShowUserProfile(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <div className={`p-2 rounded-full mr-3 transition-all duration-500 group-hover:rotate-12 ${
                isScrolled ? 'bg-brand-500 text-brand-950' : 'bg-white/10 text-brand-500'
              }`}>
                <Utensils className="h-5 w-5" />
              </div>
              <span className={`text-2xl font-bold font-serif tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-white' : 'text-white drop-shadow-md'
              }`}>
                Ember<span className="text-brand-500">&</span>Ash
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Menu', 'Booking'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())} 
                  className="text-white/80 hover:text-white font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 relative group py-2"
                >
                  {item}
                  <span className="absolute bottom-0 left-1/2 w-0 h-px bg-brand-500 transition-all duration-300 group-hover:w-full group-hover:left-0 opacity-0 group-hover:opacity-100"></span>
                </button>
              ))}
              
              <div className={`h-4 w-px mx-2 transition-colors duration-300 ${isScrolled ? 'bg-white/10' : 'bg-white/20'}`}></div>
              
              {/* User / Login */}
              {currentUser ? (
                <div className="flex items-center gap-4 group relative">
                   <button 
                     onClick={() => setShowUserProfile(true)}
                     className="flex items-center gap-2 text-white/90 hover:text-white cursor-pointer transition-colors"
                   >
                     <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-brand-950 font-bold text-sm">
                       {currentUser.name.charAt(0)}
                     </div>
                     <span className="text-sm font-medium">{currentUser.name}</span>
                   </button>
                   
                   {currentUser.isAdmin && (
                     <button
                       onClick={() => setShowAdminDashboard(true)}
                       className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 uppercase tracking-wider font-semibold ml-2 border border-brand-500/50 px-2 py-1 rounded"
                     >
                       <LayoutDashboard className="w-3 h-3" /> Dashboard
                     </button>
                   )}

                   <button 
                     onClick={handleLogout}
                     className="text-xs text-brand-400 hover:text-brand-300 uppercase tracking-wider font-semibold ml-2"
                   >
                     Logout
                   </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center gap-2 text-white/80 hover:text-white font-medium text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Login
                </button>
              )}

              <button 
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 rounded-full transition-all duration-300 group ${
                  isScrolled ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/10'
                }`}
                aria-label="Open Cart"
              >
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold text-white bg-brand-600 rounded-full animate-bounce shadow-lg">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-1 text-white hover:text-brand-400 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-4 w-4 text-[9px] font-bold text-brand-950 bg-brand-500 rounded-full border-2 border-brand-900">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isScrolled ? 'hover:bg-white/10 text-white' : 'text-white hover:bg-white/10'
                }`}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-brand-950/95 backdrop-blur-xl border-t border-white/5 shadow-2xl transition-all duration-300 ease-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
        }`}>
          <div className="px-6 py-8 space-y-4">
            {currentUser ? (
              <div className="pb-4 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-brand-950 font-bold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-serif text-lg">{currentUser.name}</p>
                      <p className="text-brand-400 text-xs">{currentUser.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-white/50 hover:text-brand-400"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={() => { setShowUserProfile(true); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-800 text-white hover:bg-brand-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  My Profile
                </button>

                {currentUser.isAdmin && (
                   <button 
                    onClick={() => { setShowAdminDashboard(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-800 text-brand-400 border border-brand-700 hover:bg-brand-700 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Admin Dashboard</span>
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => { setIsLoginOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-800 text-white hover:bg-brand-700 transition-colors mb-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In / Sign Up</span>
              </button>
            )}

            {['Home', 'Menu', 'Booking'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="block w-full text-center px-4 py-3 rounded-lg text-lg font-serif tracking-wide text-white hover:bg-brand-500/10 hover:text-brand-400 transition-all duration-200 border border-transparent hover:border-brand-500/20"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-0">
        <div id="home">
          <Hero onOrderClick={() => scrollToSection('menu')} onBookClick={() => scrollToSection('booking')} />
        </div>
        
        <Menu 
          cartItems={cartItems} 
          onAddToCart={addToCart} 
          onUpdateQuantity={updateQuantity} 
        />
        
        <div className="bg-brand-950 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif mb-8 italic text-brand-50">"Where flavor meets fire"</h2>
            <p className="max-w-2xl mx-auto text-xl text-brand-200/80 mb-10 leading-relaxed font-light">
              We believe in the transformative power of open-fire cooking. Every dish is touched by smoke or flame, unlocking depths of flavor you won't find anywhere else.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent mx-auto rounded-full"></div>
          </div>
        </div>

        <Booking currentUser={currentUser} />
      </main>

      {/* Footer */}
      <footer className="bg-black text-brand-200/60 border-t border-brand-900 pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                 <div className="bg-brand-900 p-2 rounded-lg mr-3 border border-brand-800">
                  <Utensils className="h-5 w-5 text-brand-500" />
                </div>
                <h3 className="text-brand-50 text-xl font-bold font-serif">Ember & Ash</h3>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Bringing the primal art of cooking to modern dining. 
                Sustainably sourced, expertly prepared, and served with passion.
              </p>
            </div>
            <div>
              <h3 className="text-brand-50 text-lg font-bold mb-6 font-serif border-b border-brand-800 pb-2 inline-block">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-start text-sm group cursor-pointer">
                  <MapPin className="w-5 h-5 mr-3 text-brand-600 group-hover:text-brand-500 transition-colors mt-0.5" />
                  <span className="group-hover:text-brand-100 transition-colors">123 Culinary Blvd, Food City, FC 90210</span>
                </div>
                <div className="flex items-center text-sm group cursor-pointer">
                  <Phone className="w-5 h-5 mr-3 text-brand-600 group-hover:text-brand-500 transition-colors" />
                  <span className="group-hover:text-brand-100 transition-colors">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-brand-50 text-lg font-bold mb-6 font-serif border-b border-brand-800 pb-2 inline-block">Follow Us</h3>
              <div className="flex space-x-6">
                <a href="#" className="text-brand-700 hover:text-brand-500 hover:scale-110 transition-all"><Facebook className="w-6 h-6" /></a>
                <a href="#" className="text-brand-700 hover:text-brand-500 hover:scale-110 transition-all"><Instagram className="w-6 h-6" /></a>
                <a href="#" className="text-brand-700 hover:text-brand-500 hover:scale-110 transition-all"><Twitter className="w-6 h-6" /></a>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-brand-900 pt-8 text-center text-sm">
            &copy; 2024 Ember & Ash. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Mobile Floating Cart Bar */}
      {totalItems > 0 && !showAdminDashboard && !showUserProfile && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-brand-500 text-brand-950 p-4 rounded-xl shadow-[0_0_20px_rgba(232,93,4,0.4)] flex items-center justify-between border border-brand-400 font-bold backdrop-blur-md"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-brand-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs border border-brand-700">
                {totalItems}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm">View Cart</span>
                <span className="text-[10px] opacity-80 font-medium uppercase tracking-wider">Checkout</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-2">${totalPrice.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5 opacity-75" />
            </div>
          </button>
        </div>
      )}

      {/* Overlays */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        currentUser={currentUser}
        onLoginRequired={() => {
           setCheckoutMessage("Please log in or create an account to complete your order.");
           setIsCartOpen(false); // Close cart so login modal is fully visible and focused
           setIsLoginOpen(true);
        }}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => {
           setIsLoginOpen(false);
           setCheckoutMessage(''); // Clear message on close
           // If user closed login without logging in, we might want to re-open cart? 
           // But standard behavior is just close. User can open cart again.
        }}
        onLogin={(user) => {
           handleLogin(user);
           setCheckoutMessage('');
           // Automatically re-open cart after successful login if they were trying to checkout
           if (checkoutMessage) {
              setIsCartOpen(true);
           }
        }}
        checkoutMessage={checkoutMessage}
      />
      
      {!showAdminDashboard && !showUserProfile && <AIChat />}
    </div>
  );
}

export default App;