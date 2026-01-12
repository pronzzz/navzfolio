import React, { useState, useEffect } from 'react';
import { X, Instagram, Mail, Camera, Twitter, ArrowRight, Sliders } from 'lucide-react';

import { PORTFOLIO_ITEMS } from './data/portfolio';

const SOCIAL_LINKS = [
  { name: 'Instagram', url: '#', icon: <Instagram size={20} /> },
  { name: 'Twitter', url: '#', icon: <Twitter size={20} /> },
  { name: 'Email', url: 'mailto:hello@pranav.com', icon: <Mail size={20} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  const handleNavClick = (tab) => {
    if (tab === activeTab) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab(tab);
  };

  return (
    <div className={`min-h-screen bg-white text-zinc-900 font-sans-body selection:bg-zinc-200 selection:text-black transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* Font Imports and Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-40 py-6 px-6 md:px-12 flex justify-between items-center border-b border-zinc-100">
        <div
          onClick={() => handleNavClick('gallery')}
          className="text-2xl font-serif-display font-medium tracking-tight cursor-pointer hover:opacity-60 transition-opacity"
        >
          Pranav Dwivedi
        </div>

        <div className="flex gap-8 text-xs font-mono-tech font-bold uppercase tracking-widest text-zinc-500">
          {['Gallery', 'About', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item.toLowerCase())}
              className={`relative py-1 transition-colors duration-300 ${activeTab === item.toLowerCase() ? 'text-black' : 'hover:text-black'}`}
            >
              {item}
              {activeTab === item.toLowerCase() && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black animate-slideIn" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-32 pb-20 px-6 md:px-12 min-h-screen max-w-7xl mx-auto">

        {/* Gallery View */}
        {activeTab === 'gallery' && (
          <div className="animate-fadeIn">
            <header className="mb-12 max-w-xl">
              <h1 className="text-5xl md:text-6xl font-serif-display italic tracking-tight mb-6 text-black">
                Visual Diary
              </h1>
              <p className="text-zinc-500 font-mono-tech text-xs md:text-sm leading-relaxed max-w-md border-l border-zinc-200 pl-4">
                A collection of moments, light, and experiments with color grading.
                Casual photography fueled by custom presets.
              </p>
            </header>

            {/* Masonry Layout using CSS Columns */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {PORTFOLIO_ITEMS.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="group break-inside-avoid relative cursor-zoom-in overflow-hidden bg-zinc-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Hover Overlay - Desktop Only */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About View */}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto pt-10 animate-fadeIn">
            <div className="aspect-[3/4] w-full max-w-sm mx-auto bg-zinc-100 mb-12 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1542596768-5d1d21f1cfbc?q=80&w=1000&auto=format&fit=crop"
                alt="Pranav"
                className="w-full h-full object-cover opacity-90 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>

            <h2 className="text-4xl font-serif-display italic mb-8 tracking-tight text-center">The Editor Behind the Lens</h2>
            <div className="space-y-6 text-zinc-600 font-sans-body font-light leading-relaxed text-lg">
              <p>
                Hi, I'm Pranav. I'm not a studio photographer, and I don't carry around five lenses.
                I capture what I see, when I see it.
              </p>
              <p>
                My real passion lies in the edit. Over the years, I've developed a suite of custom presets
                that emulate the nostalgia of film stocks while retaining modern clarity.
                Every photo in this gallery is a result of my personal color grading experiments.
              </p>
              <p>
                Whether it's the neon glow of a late-night street or the harsh shadows of noon,
                I try to find the cinematic in the mundane.
              </p>
            </div>

            <div className="mt-12 pt-12 border-t border-zinc-100 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-mono-tech font-bold uppercase tracking-wider mb-4 text-zinc-400">Gear</h3>
                <ul className="text-sm font-sans-body space-y-2 text-zinc-800">
                  <li>Sony A7III</li>
                  <li>35mm f/1.4</li>
                  <li>Fujifilm X100V</li>
                  <li>iPhone 15 Pro</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-mono-tech font-bold uppercase tracking-wider mb-4 text-zinc-400">Software</h3>
                <ul className="text-sm font-sans-body space-y-2 text-zinc-800">
                  <li>Lightroom Classic</li>
                  <li>Capture One</li>
                  <li>Photoshop</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Contact View */}
        {activeTab === 'contact' && (
          <div className="max-w-xl mx-auto pt-20 animate-fadeIn">
            <h1 className="text-6xl md:text-7xl font-serif-display mb-12 tracking-tight">
              Let's create <br /> <span className="italic text-zinc-500">something</span> together.
            </h1>

            <div className="space-y-12">
              <div className="group">
                <h3 className="text-xs font-mono-tech text-zinc-400 uppercase tracking-widest mb-3">Email Me</h3>
                <a href="mailto:hello@pranav.com" className="font-serif-display italic text-3xl md:text-4xl hover:text-zinc-500 transition-colors flex items-center gap-4">
                  hello@pranav.com
                  <ArrowRight size={24} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </a>
              </div>

              <div>
                <h3 className="text-xs font-mono-tech text-zinc-400 uppercase tracking-widest mb-4">Socials</h3>
                <div className="flex gap-6">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      className="p-4 border border-zinc-200 rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t border-zinc-100">
                <p className="font-mono-tech text-zinc-400 text-xs leading-loose">
                  BASED IN NEW YORK CITY.<br />
                  AVAILABLE FOR FREELANCE EDITING AND CASUAL SHOOTS.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/98 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-black transition-colors"
          >
            <X size={32} strokeWidth={1} />
          </button>

          <div
            className="relative max-w-[95vw] max-h-[95vh] flex flex-col items-center justify-center h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shadow-2xl shadow-zinc-200/50 max-h-[85vh] flex-shrink-1">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[80vh] w-auto object-contain animate-scaleIn"
              />
            </div>

            {/* Minimal Info Bar */}
            <div className="mt-8 text-center animate-fadeIn delay-100 flex-shrink-0">
              <h3 className="text-2xl font-serif-display italic text-zinc-900 mb-2">{selectedImage.title}</h3>
              <div className="flex items-center justify-center gap-3 text-zinc-500 font-mono-tech">
                <Sliders size={14} />
                <span className="text-xs uppercase tracking-widest font-bold text-zinc-400">
                  Preset: <span className="text-black bg-zinc-100 px-2 py-1 rounded">{selectedImage.preset}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
