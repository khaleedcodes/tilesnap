interface TileSnapLogoProps {
  size?: number;
  className?: string;
}

export default function TileSnapLogo({ size = 120, className = "" }: TileSnapLogoProps) {
  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="56"
          fill="#FFD700"
          stroke="#000"
          strokeWidth="4"
        />
        
        {/* Grid of tiles */}
        <g>
          {/* Top left tile */}
          <rect
            x="20"
            y="20"
            width="32"
            height="32"
            rx="6"
            fill="#FF6B6B"
            stroke="#000"
            strokeWidth="3"
          />
          
          {/* Top right tile */}
          <rect
            x="68"
            y="20"
            width="32"
            height="32"
            rx="6"
            fill="#4ECDC4"
            stroke="#000"
            strokeWidth="3"
          />
          
          {/* Bottom left tile */}
          <rect
            x="20"
            y="68"
            width="32"
            height="32"
            rx="6"
            fill="#45B7D1"
            stroke="#000"
            strokeWidth="3"
          />
          
          {/* Bottom right tile (highlighted/snapping) */}
          <rect
            x="68"
            y="68"
            width="32"
            height="32"
            rx="6"
            fill="#96CEB4"
            stroke="#000"
            strokeWidth="3"
          />
          
          {/* Snap effect lines */}
          <g>
            <line
              x1="36"
              y1="15"
              x2="36"
              y2="25"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="84"
              y1="15"
              x2="84"
              y2="25"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="15"
              y1="36"
              x2="25"
              y2="36"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="95"
              y1="36"
              x2="105"
              y2="36"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          
          {/* Central connecting plus sign */}
          <circle
            cx="60"
            cy="60"
            r="8"
            fill="#FFEAA7"
            stroke="#000"
            strokeWidth="2"
          />
          <line
            x1="60"
            y1="54"
            x2="60"
            y2="66"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="60"
            x2="66"
            y2="60"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        
        {/* Sparkle effects */}
        <g>
          <circle cx="30" cy="110" r="2" fill="#FFD700" />
          <circle cx="90" cy="110" r="2" fill="#FFD700" />
          <circle cx="110" cy="30" r="2" fill="#FFD700" />
          <circle cx="10" cy="90" r="2" fill="#FFD700" />
        </g>
      </svg>
      
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900 cartoon-text">
          TileSnap
        </h1>
        <p className="text-sm text-gray-600 font-medium -mt-1">
          Crafting Stories, One Tile at a Time
        </p>
      </div>
    </div>
  );
}

// Compact version for headers
export function TileSnapLogoCompact({ size = 40, className = "" }: TileSnapLogoProps) {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <circle cx="60" cy="60" r="56" fill="#FFD700" stroke="#000" strokeWidth="4" />
        <rect x="20" y="20" width="32" height="32" rx="6" fill="#FF6B6B" stroke="#000" strokeWidth="3" />
        <rect x="68" y="20" width="32" height="32" rx="6" fill="#4ECDC4" stroke="#000" strokeWidth="3" />
        <rect x="20" y="68" width="32" height="32" rx="6" fill="#45B7D1" stroke="#000" strokeWidth="3" />
        <rect x="68" y="68" width="32" height="32" rx="6" fill="#96CEB4" stroke="#000" strokeWidth="3" />
        <circle cx="60" cy="60" r="8" fill="#FFEAA7" stroke="#000" strokeWidth="2" />
      </svg>
      <span className="text-xl font-bold text-gray-900 cartoon-text">TileSnap</span>
    </div>
  );
}