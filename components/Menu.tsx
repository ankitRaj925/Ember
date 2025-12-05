import React, { useState } from 'react';
import { Plus, Flame, Leaf, UtensilsCrossed, XCircle, Search, Minus, Activity } from 'lucide-react';
import { MenuItem, CartItem } from '../types';
import { MENU_ITEMS } from '../constants';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface MenuProps {
  cartItems: CartItem[];
  onAddToCart: (item: MenuItem, quantity: number) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

const Menu: React.FC<MenuProps> = ({ cartItems, onAddToCart, onUpdateQuantity }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'starter', label: 'Starters' },
    { id: 'main', label: 'Mains' },
    { id: 'dessert', label: 'Desserts' },
    { id: 'drink', label: 'Drinks' },
  ];

  const filteredItems = MENU_ITEMS.filter(item => {
    // Category Filter
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesDesc = item.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) {
        return false;
      }
    }
    
    return true;
  });

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Helper to get quantity from the global cart
  const getItemQuantity = (id: string) => {
    const found = cartItems.find(item => item.id === id);
    return found ? found.quantity : 0;
  };

  // Handler for adding/increasing
  const handleIncrease = (item: MenuItem) => {
    onAddToCart(item, 1);
  };

  // Handler for decreasing
  const handleDecrease = (id: string) => {
    onUpdateQuantity(id, -1);
  };

  return (
    <div className="bg-brand-900 py-12 sm:py-28 relative overflow-hidden" id="menu">
       {/* Background accent */}
       <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl font-extrabold text-brand-50 sm:text-5xl font-serif">Signature Menu</h2>
          <div className="w-20 h-1 bg-brand-500 mx-auto mt-4 sm:mt-6 rounded-full"></div>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-brand-200/70 max-w-2xl mx-auto font-light">
            Curated dishes prepared with passion, precision, and a touch of smoke.
          </p>
        </div>

        {/* Search and Filter Container */}
        <div className="flex flex-col items-center mb-10 sm:mb-16 space-y-6 w-full max-w-4xl mx-auto">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md px-2 sm:px-0 group">
            <div className="absolute inset-y-0 left-3 sm:left-2 flex items-center pointer-events-none z-10 pl-1">
               <div className="p-2.5 bg-brand-500 rounded-full shadow-[0_0_15px_rgba(232,93,4,0.4)] flex items-center justify-center">
                  <Search className="h-4 w-4 text-brand-950" />
               </div>
            </div>
            <input
              type="text"
              className="block w-full pl-16 pr-6 py-4 border border-brand-800 rounded-full leading-5 bg-brand-950/80 text-brand-50 placeholder-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm sm:text-base transition-all shadow-xl backdrop-blur-sm"
              placeholder="Search our menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Main Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 border whitespace-nowrap
                  ${activeCategory === cat.id 
                    ? 'bg-brand-500 text-white border-brand-500 shadow-[0_0_15px_rgba(232,93,4,0.4)]' 
                    : 'bg-transparent text-brand-200 border-brand-800 hover:border-brand-600 hover:text-white'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid - 2 cols on mobile, 3/4 on desktop */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in-up">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              
              return (
                <div key={item.id} className="group relative bg-brand-800 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-brand-700/50 flex flex-col hover:-translate-y-1">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-800 h-32 sm:h-56 overflow-hidden relative">
                    {imageErrors[item.id] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-brand-800 border-b border-brand-700/50">
                        <UtensilsCrossed className="w-8 h-8 sm:w-12 sm:h-12 text-brand-700 mb-2" />
                        <span className="text-[10px] sm:text-xs text-brand-500 font-serif tracking-widest uppercase">Unavailable</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={() => handleImageError(item.id)}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent opacity-60"></div>
                      </>
                    )}
                    
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col sm:flex-row gap-1 z-10 items-end">
                      {item.isVegetarian && (
                        <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-900/90 text-green-300 backdrop-blur-sm border border-green-700 shadow-sm" title="Vegetarian">
                          <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" /> <span className="hidden sm:inline">Veg</span>
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-red-900/90 text-red-300 backdrop-blur-sm border border-red-700 shadow-sm" title="Spicy">
                          <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" /> <span className="hidden sm:inline">Spicy</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 flex-1 flex flex-col relative">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-xl font-bold text-brand-50 font-serif group-hover:text-brand-400 transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <p className="mt-1 sm:mt-3 text-xs sm:text-sm text-brand-200/60 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                       {/* Nutri Info */}
                       {item.calories && (
                        <div className="mt-2 flex items-center text-[10px] sm:text-xs text-brand-400/80 font-medium">
                          <Activity className="w-3 h-3 mr-1" />
                          {item.calories} kcal
                        </div>
                      )}
                    </div>
                    <div className="mt-3 sm:mt-6 flex flex-wrap items-center justify-between pt-3 sm:pt-4 border-t border-brand-700/50 gap-y-2">
                      <p className="text-base sm:text-2xl font-bold text-brand-400 font-serif w-full sm:w-auto">${item.price}</p>
                      
                      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        {/* Quantity Selector - Directly controls cart */}
                        <div className={`flex items-center rounded-full p-0.5 border transition-all duration-300 ${
                          qty > 0 
                            ? 'bg-brand-900 border-brand-500 shadow-[0_0_10px_rgba(232,93,4,0.3)]' 
                            : 'bg-brand-800 border-brand-700/50'
                        }`}>
                          <button 
                            onClick={() => handleDecrease(item.id)}
                            disabled={qty === 0}
                            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors ${
                              qty > 0 
                                ? 'hover:bg-brand-800 text-brand-300 cursor-pointer' 
                                : 'text-brand-700 cursor-not-allowed'
                            }`}
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          
                          <span className={`w-6 sm:w-8 text-center text-sm font-bold select-none ${
                            qty > 0 ? 'text-brand-50' : 'text-brand-500/50'
                          }`}>
                            {qty}
                          </span>
                          
                          <button 
                            onClick={() => handleIncrease(item)}
                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-brand-700 text-brand-50 transition-colors bg-brand-600 shadow-md"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-brand-800/30 rounded-3xl border border-brand-800 border-dashed animate-fade-in">
            <div className="inline-block p-4 rounded-full bg-brand-800 mb-4">
              <XCircle className="w-8 h-8 text-brand-500" />
            </div>
            <h3 className="text-xl font-serif font-bold text-brand-100">No dishes found</h3>
            <p className="text-brand-200/50 mt-2 mb-6">Try adjusting your search or category.</p>
            <button 
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="px-6 py-2 rounded-full bg-brand-700 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;