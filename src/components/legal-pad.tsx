"use client";

import React, { useState } from "react";

export function LegalPad() {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleNextPage = () => {
    setIsFlipping(true);
    // Reset the animation after it finishes so you can flip again
    setTimeout(() => setIsFlipping(false), 600);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto drop-shadow-xl my-12" style={{ perspective: "1200px" }}>
      
      {/* 1. THE GLUED BINDING (Top Bar) */}
      <div className="relative h-10 bg-[#5A1818] rounded-t-md z-20 overflow-hidden border-b-2 border-[#3A0F0F]">
        {/* Leather/fabric texture overlay for the binding */}
        <div className="absolute inset-0 opacity-30 mix-blend-multiply bg-[url('/textures/paper-light.jpg')] bg-cover" />
        
        {/* Faint staples in the binding */}
        <div className="absolute top-1/2 left-1/4 w-4 h-1.5 bg-gray-300 rounded-sm -translate-y-1/2 shadow-inner" />
        <div className="absolute top-1/2 right-1/4 w-4 h-1.5 bg-gray-300 rounded-sm -translate-y-1/2 shadow-inner" />
      </div>

      {/* 2. THE PAPER CONTAINER */}
      {/* This holds a "static" background page so when the top page flips, there is paper underneath */}
      <div className="relative bg-legal-pad rounded-b-md shadow-md h-[400px]">
        
        {/* 3. THE FLIPPING PAGE */}
        <div 
          className={`absolute inset-0 bg-legal-pad rounded-b-md z-10 origin-top transition-transform ${isFlipping ? 'animate-page-flip' : ''}`}
        >
          {/* Content Wrapper - Pushed right to clear the double red margin */}
          <div className="pl-[64px] pr-6 pt-8 text-[var(--color-ink)] font-[family-name:var(--font-body)] text-lg leading-[32px]">
            
            <h3 className="font-bold text-xl font-[family-name:var(--font-hand)] mb-4">
              What I Can Build:
            </h3>
            
            <ol className="list-decimal pl-5">
              <li>Scalable RESTful APIs & backend architectures</li>
              <li>Robust database schemas (SQL & MongoDB)</li>
              <li>High-performance parallel computing (CUDA/MPI)</li>
            </ol>

          </div>

          {/* Interactive Flip Button (Bottom Right) */}
          <button 
            onClick={handleNextPage}
            className="absolute bottom-4 right-4 text-sm font-medium text-[var(--color-ink-light)] hover:text-[var(--color-ink)] hover:underline flex items-center gap-1 transition-colors"
          >
            Turn Page <span>↳</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}