'use client';

import React from 'react';

export default function ChefAnimation() {
  return (
    <div className="chef-animation-wrapper" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <style>{`
          /* CSS Keyframes for Cooking Animations */
          
          /* Flicker flame */
          @keyframes flicker {
            0%, 100% {
              transform: scaleY(0.9) skewX(-2deg);
              opacity: 0.85;
            }
            50% {
              transform: scaleY(1.1) skewX(2deg);
              opacity: 1;
            }
          }
          
          /* Wobble pot lid */
          @keyframes wobble-lid {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            20% {
              transform: translateY(-4px) rotate(-1.5deg);
            }
            40% {
              transform: translateY(0) rotate(0deg);
            }
            60% {
              transform: translateY(-3px) rotate(1.5deg);
            }
            80% {
              transform: translateY(0) rotate(0deg);
            }
          }
          
          /* Drift steam */
          @keyframes drift-steam {
            0% {
              stroke-dashoffset: 200;
              opacity: 0;
              transform: translateY(15px) translateX(0) scaleX(1);
            }
            20% {
              opacity: 0.6;
            }
            80% {
              opacity: 0.3;
            }
            100% {
              stroke-dashoffset: 0;
              opacity: 0;
              transform: translateY(-80px) translateX(20px) scaleX(1.2);
            }
          }
          
          /* Flip food item 1 (Carrot) */
          @keyframes flip-food-1 {
            0% {
              transform: translateY(0) rotate(0deg) scale(0.9);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            50% {
              transform: translateY(-110px) rotate(180deg) scale(1.1);
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(0) rotate(360deg) scale(0.9);
              opacity: 0;
            }
          }

          /* Flip food item 2 (Broccoli) */
          @keyframes flip-food-2 {
            0% {
              transform: translateY(0) rotate(0deg) scale(0.8);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            55% {
              transform: translateY(-145px) rotate(-140deg) scale(1);
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(0) rotate(-280deg) scale(0.8);
              opacity: 0;
            }
          }
          
          /* Flip food item 3 (Mushroom) */
          @keyframes flip-food-3 {
            0% {
              transform: translateY(0) rotate(0deg) scale(1);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            45% {
              transform: translateY(-90px) rotate(90deg) scale(1.1);
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(0) rotate(180deg) scale(1);
              opacity: 0;
            }
          }

          /* Bubble rising */
          @keyframes rise-bubble {
            0% {
              transform: translateY(0) scale(0.5);
              opacity: 0;
            }
            20% {
              opacity: 0.8;
            }
            80% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-50px) scale(1.2);
              opacity: 0;
            }
          }

          /* Sparkle pulse */
          @keyframes sparkle-glow {
            0%, 100% {
              transform: scale(0.8);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.9;
            }
          }
          
          /* Apply animations to classes */
          .flame-path {
            animation: flicker 0.15s ease-in-out infinite alternate;
            transform-origin: bottom center;
          }
          .pot-lid {
            animation: wobble-lid 1.2s ease-in-out infinite;
            transform-origin: center bottom;
          }
          .steam-line-1 {
            animation: drift-steam 4s linear infinite;
            stroke-dasharray: 100;
          }
          .steam-line-2 {
            animation: drift-steam 3.5s linear infinite;
            animation-delay: 1.5s;
            stroke-dasharray: 100;
          }
          .steam-line-3 {
            animation: drift-steam 4.5s linear infinite;
            animation-delay: 0.7s;
            stroke-dasharray: 100;
          }
          .food-carrot {
            animation: flip-food-1 3.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            transform-origin: center;
          }
          .food-broccoli {
            animation: flip-food-2 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            animation-delay: 0.8s;
            transform-origin: center;
          }
          .food-mushroom {
            animation: flip-food-3 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
            animation-delay: 1.6s;
            transform-origin: center;
          }
          .bubble {
            animation: rise-bubble 2s ease-out infinite;
            transform-origin: center;
          }
          .bubble-delay-1 {
            animation-delay: 0.6s;
          }
          .bubble-delay-2 {
            animation-delay: 1.3s;
          }
          .sparkle-group path {
            animation: sparkle-glow 2.5s ease-in-out infinite;
          }
          .sparkle-2 {
            animation-delay: 0.7s !important;
          }
          .sparkle-3 {
            animation-delay: 1.4s !important;
          }
        `}</style>

        <defs>
          {/* Gradients */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="stoveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1C1C1C" />
            <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1C1C1C" />
          </linearGradient>
          <linearGradient id="steamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#F5F0E8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#F5F0E8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="250" cy="250" r="180" fill="url(#bgGlow)" opacity="0.25" />

        {/* Cooktop Counter */}
        <path d="M 50 380 Q 250 390 450 380 L 450 420 Q 250 430 50 420 Z" fill="url(#stoveGrad)" stroke="#C9A84C" strokeWidth="1" opacity="0.3" />
        <line x1="40" y1="380" x2="460" y2="380" stroke="#C9A84C" strokeWidth="3" opacity="0.8" />
        
        {/* Steam Loops */}
        <g stroke="url(#steamGrad)" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M 130 220 C 120 180 140 150 130 110" className="steam-line-1" />
          <path d="M 155 220 C 165 190 145 160 160 120" className="steam-line-2" />
          <path d="M 180 220 C 170 180 190 140 175 105" className="steam-line-3" />
        </g>

        {/* Fire/Flames */}
        <g className="flame-group" transform="translate(325, 345)">
          {/* Main outer fire */}
          <path d="M -30 25 C -45 5 -35 -20 0 -45 C 35 -20 45 5 30 25 Z" fill="#E85A24" opacity="0.4" className="flame-path" />
          {/* Inner fire */}
          <path d="M -20 25 C -30 10 -25 -10 0 -30 C 25 -10 30 10 20 25 Z" fill="#FFA800" opacity="0.8" className="flame-path" />
          {/* Core flame */}
          <path d="M -10 25 C -15 15 -10 0 0 -15 C 10 0 15 15 10 25 Z" fill="#FFED4B" className="flame-path" />
        </g>

        {/* Boiling Pot (left side) */}
        <g transform="translate(70, 210)">
          {/* Pot Handles */}
          <path d="M -15 70 C -35 70 -35 90 -15 90" stroke="#C9A84C" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 175 70 C 195 70 195 90 175 90" stroke="#C9A84C" strokeWidth="6" fill="none" strokeLinecap="round" />

          {/* Pot Body */}
          <rect x="0" y="50" width="160" height="110" rx="20" fill="#141414" stroke="#C9A84C" strokeWidth="4" />
          {/* Pot details */}
          <path d="M 0 70 L 160 70" stroke="rgba(201, 168, 76, 0.3)" strokeWidth="2" />
          
          {/* Boiling Water Bubbles */}
          <g fill="#C9A84C" opacity="0.6">
            <circle cx="40" cy="45" r="4" className="bubble bubble-delay-1" />
            <circle cx="80" cy="45" r="5" className="bubble" />
            <circle cx="120" cy="45" r="3" className="bubble bubble-delay-2" />
          </g>

          {/* Wobbling Pot Lid */}
          <g className="pot-lid">
            {/* Lid base */}
            <path d="M -5 50 Q 80 30 165 50 Z" fill="#1f1f1f" stroke="#C9A84C" strokeWidth="4" />
            {/* Lid handle */}
            <path d="M 65 34 C 65 20 95 20 95 34" stroke="#C9A84C" strokeWidth="4" fill="#141414" />
          </g>
        </g>

        {/* Frying Pan (right side) */}
        <g transform="translate(250, 310)">
          {/* Pan Handle */}
          <path d="M 150 40 L 230 15" stroke="#C9A84C" strokeWidth="8" strokeLinecap="round" />
          <path d="M 150 40 L 230 15" stroke="#121212" strokeWidth="4" strokeLinecap="round" />

          {/* Pan Body */}
          <path d="M 0 50 C 0 80 150 80 150 50 L 140 30 L 10 30 Z" fill="#1c1c1c" stroke="#C9A84C" strokeWidth="4" />
          {/* Inner dark rim */}
          <path d="M 8 36 C 8 68 142 68 142 36" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
        </g>

        {/* Flipping Vegetables (above Frying Pan) */}
        <g transform="translate(250, 200)">
          {/* Broccoli slice */}
          <g className="food-broccoli">
            {/* Stem */}
            <path d="M 60 70 L 60 85" stroke="#4CD37F" strokeWidth="6" strokeLinecap="round" />
            {/* Crown */}
            <circle cx="50" cy="65" r="10" fill="#3AA663" />
            <circle cx="70" cy="65" r="10" fill="#3AA663" />
            <circle cx="60" cy="55" r="12" fill="#4CD37F" />
          </g>

          {/* Carrot slice */}
          <g className="food-carrot">
            <circle cx="95" cy="85" r="11" fill="#FFA502" stroke="#FF6B6B" strokeWidth="2" />
            <circle cx="92" cy="82" r="3" fill="#FFE57F" opacity="0.6" />
          </g>

          {/* Mushroom slice */}
          <g className="food-mushroom">
            {/* Cap */}
            <path d="M 10 80 C 10 65 40 65 40 80 Z" fill="#E2C9B1" stroke="#8c7864" strokeWidth="1.5" />
            {/* Stem */}
            <rect x="21" y="80" width="8" height="12" rx="2" fill="#F5F0E8" stroke="#8c7864" strokeWidth="1.5" />
          </g>
        </g>

        {/* Sparkles / Magic Glows */}
        <g className="sparkle-group" transform="translate(180, 150)">
          <path d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z" fill="#C9A84C" />
        </g>
        <g className="sparkle-group sparkle-2" transform="translate(340, 110)">
          <path d="M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z" fill="#F5F0E8" />
        </g>
        <g className="sparkle-group sparkle-3" transform="translate(260, 260)">
          <path d="M 0 -5 L 1 -1 L 5 0 L 1 1 L 0 5 L -1 1 L -5 0 L -1 -1 Z" fill="#C9A84C" />
        </g>
      </svg>
    </div>
  );
}
