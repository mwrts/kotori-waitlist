
import React from 'react';

interface KotoriIconProps {
  className?: string;
  size?: number;
  primaryColor?: string;
}

const KotoriIcon: React.FC<KotoriIconProps> = ({ 
  className = "", 
  size = 40,
  primaryColor = "var(--primary)"
}) => {
  const strokeColor = "#3D3D3D"; // Softer charcoal instead of harsh black
  const strokeWidthMain = "2.5";
  const strokeWidthDetail = "1.8";

  return (
    <div className={`kotori-icon-container ${className}`} style={{ width: size, height: size }}>
      <style>{`
        @keyframes kotori-sway {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-6deg); }
          75% { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }
        .kotori-bird-group {
          transform-origin: 60px 80px;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .kotori-icon-container:hover .kotori-bird-group {
          animation: kotori-sway 2.5s ease-in-out infinite;
        }
      `}</style>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Kotori Bird Icon"
      >
        {/* Shadow under the bird */}
        <ellipse cx="60" cy="110" rx="25" ry="4" fill={strokeColor} fillOpacity="0.08" />

        <g className="kotori-bird-group">
          {/* Feet - Softened lines */}
          <path 
            d="M48 102C48 106 46 108 42 108M48 102C48 106 51 108 54 108" 
            stroke={strokeColor} 
            strokeWidth={strokeWidthDetail} 
            strokeLinecap="round" 
          />
          <path 
            d="M72 102C72 106 70 108 66 108M72 102C72 106 75 108 78 108" 
            stroke={strokeColor} 
            strokeWidth={strokeWidthDetail} 
            strokeLinecap="round" 
          />

          {/* Wings - Behind Body */}
          <path 
            d="M26 68C18 68 18 82 26 82" 
            stroke={strokeColor} 
            strokeWidth={strokeWidthMain} 
            strokeLinecap="round"
          />
          <path 
            d="M94 68C102 68 102 82 94 82" 
            stroke={strokeColor} 
            strokeWidth={strokeWidthMain} 
            strokeLinecap="round"
          />

          {/* Main Body - Perfect Borb Shape */}
          <circle 
            cx="60" 
            cy="72" 
            r="40" 
            fill={primaryColor} 
            stroke={strokeColor} 
            strokeWidth={strokeWidthMain} 
          />
          
          {/* Tummy highlight - Softer */}
          <circle 
            cx="60" 
            cy="84" 
            r="26" 
            fill="white" 
            fillOpacity="0.25" 
          />

          {/* Blush - For the extra cute factor */}
          <ellipse cx="38" cy="74" rx="6" ry="3" fill="#FF80AB" fillOpacity="0.2" />
          <ellipse cx="82" cy="74" rx="6" ry="3" fill="#FF80AB" fillOpacity="0.2" />
          
          {/* Eyes - Small and Twinkly */}
          <g>
            {/* Left Eye */}
            <circle cx="44" cy="62" r="10" fill="white" stroke={strokeColor} strokeWidth="2" />
            <circle cx="44" cy="62" r="5" fill={strokeColor} />
            <circle cx="46" cy="60" r="1.8" fill="white" />
            
            {/* Right Eye */}
            <circle cx="76" cy="62" r="10" fill="white" stroke={strokeColor} strokeWidth="2" />
            <circle cx="76" cy="62" r="5" fill={strokeColor} />
            <circle cx="78" cy="60" r="1.8" fill="white" />
          </g>
          
          {/* Beak - Friendly rounded triangle */}
          <path 
            d="M54 74C54 70 66 70 66 74C66 81 60 85 60 85C60 85 54 81 54 74Z" 
            fill="#FFA726" 
            stroke={strokeColor} 
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Baseball Cap - Stays Vibrant Red */}
          <g transform="rotate(-4, 60, 35)">
            {/* Brim - Behind Crown */}
            <path 
              d="M80 43C80 43 105 40 112 48C105 56 80 50 80 48Z" 
              fill="#EE423E" 
              stroke={strokeColor} 
              strokeWidth={strokeWidthMain} 
              strokeLinejoin="round"
            />
            {/* Crown */}
            <path 
              d="M28 45C28 28 40 18 60 18C80 18 92 28 92 45H28Z" 
              fill="#EE423E" 
              stroke={strokeColor} 
              strokeWidth={strokeWidthMain} 
              strokeLinejoin="round"
            />
            {/* Top Button */}
            <circle cx="60" cy="18" r="4.5" fill={strokeColor} />
            <circle cx="60" cy="18" r="2.5" fill="#EE423E" />
            {/* Stitching Line */}
            <path d="M60 18V45" stroke={strokeColor} strokeWidth="1.5" strokeOpacity="0.15" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default KotoriIcon;
