"use client";

import { useEffect, useState } from 'react';
import HowItWorksSection from './shared/landing/HowItWorksSection';
import FeaturesSection from './shared/landing/FeaturesSection';
import ExternalNavigation from './shared/landing/ExternalNavigation';
import LandingSection from './shared/landing/LandingSection';

import '@/styles/landing.css';
import { useAppData } from '@/core/context/app-provider';

export default function LandingPage() {

  const { loadingUser, isAuthorized } = useAppData();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'first' | 'second' | 'third'>('first');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      if (scrollPosition < windowHeight * 0.2) {
        setActiveSection('first');
      } else if (scrollPosition < windowHeight * 1.1) {
        setActiveSection('second');
      } else {
        setActiveSection('third');
      }

      if (scrollPosition > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
    if (activeCard === cardIndex) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const getCardStyle = (cardIndex: number) => {
    const gradientColors = {
      0: 'rgba(50, 42, 58, 0.7)',   // Original purple for leftmost
      1: 'rgba(70, 42, 65, 0.5)',   // More subtle mix
      2: 'rgba(90, 42, 72, 0.5)',   // More subtle pink
      3: 'rgba(50, 42, 58, 0.7)',   // Same pattern for features section
      4: 'rgba(70, 42, 65, 0.5)',
      5: 'rgba(90, 42, 72, 0.5)'
    };

    return {
      backgroundImage: activeCard === cardIndex
        ? `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColors[cardIndex as keyof typeof gradientColors]}, transparent)`
        : 'none',
      backgroundColor: 'rgba(23, 23, 23, 0.7)',
      transition: 'background-image 0.5s ease-out'
    };
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Main Section */}
      <main className={`min-h-screen flex flex-col items-center justify-center bg-black px-8 transition-all duration-1000 ease-in-out transform 
          ${activeSection === 'first' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'}`}
      >
        {/* Top-right navigation - Back to original position */}
        <ExternalNavigation links={{ home: false, contributors: true, github: true }} />

        <LandingSection
          isLoading={loadingUser}
          isAuthorized={isAuthorized}
        />
      </main>

      <HowItWorksSection
        activeSection={activeSection}
        handleMouseMove={handleMouseMove}
        setActiveCard={setActiveCard}
        getCardStyle={getCardStyle}
      />

      <FeaturesSection
        activeSection={activeSection}
        handleMouseMove={handleMouseMove}
        setActiveCard={setActiveCard}
        getCardStyle={getCardStyle}
      />

      {/* Breadcrumb Indicators */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        {['first', 'second', 'third'].map((section) => (
          <div
            key={section}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSection === section
              ? 'bg-purple-300 scale-125'
              : 'bg-gray-600 scale-100'
              }`}
          />
        ))}
      </div>

      {/* Return to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-[#4D4D4D] hover:bg-[#666666] text-white p-4 rounded-full transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Return to top"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8L18 14H6L12 8Z" fill="currentColor" />
        </svg>
      </button>
    </>
  );
}