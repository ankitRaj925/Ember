import React, { useEffect, useState } from 'react';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface HeroProps {
  onOrderClick: () => void;
  onBookClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick, onBookClick }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Disable parallax on mobile (under 768px) to fix scroll lag/jank
      if (window.innerWidth < 768) return;

      // Limit the offset calculation to when the hero is likely in view to save resources
      if (window.scrollY < window.innerHeight * 1.2) {
        setOffset(window.scrollY);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-brand-900 overflow-hidden h-[80vh] min-h-[600px] flex items-center">
      <div 
        className="absolute w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80")',
          // Parallax calculation:
          // Start the image higher (-40%) and taller (150%) so we have room to move it down
          // as the user scrolls, creating the effect that it's further away (moving slower).
          height: '150%',
          top: '-40%',
          transform: `translate3d(0, ${offset * 0.4}px, 0)`,
          willChange: 'transform'
        }}
      >
        <div className="absolute inset-0 bg-brand-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-transparent to-brand-900/30"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-brand-500/20 text-brand-100 border border-brand-500/30 backdrop-blur-sm">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Award Winning Fine Dining
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl font-serif mb-8 drop-shadow-2xl leading-tight">
            Taste the <span className="text-brand-400 italic">Extraordinary</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-brand-50/90 font-light leading-relaxed">
            Experience a culinary journey where modern innovation meets timeless tradition. 
            Fresh ingredients, exquisite recipes, and an unforgettable atmosphere.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none flex flex-col sm:flex-col gap-4 sm:gap-6 sm:flex-row sm:justify-center">
            <button
              onClick={onOrderClick}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-brand-900 bg-brand-400 hover:bg-brand-300 transition-all duration-300 shadow-[0_0_20px_rgba(213,176,111,0.3)] hover:shadow-[0_0_30px_rgba(213,176,111,0.5)] transform hover:-translate-y-1"
            >
              Order Online
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border-2 border-brand-400 text-lg font-bold rounded-full text-brand-100 hover:bg-brand-400 hover:text-brand-900 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-1"
            >
              Book a Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;