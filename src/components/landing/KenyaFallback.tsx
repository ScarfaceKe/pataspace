import {
  KENYA_CITY_POINTS,
  KENYA_SVG_ISLAND_PATH,
  KENYA_SVG_LAKE_PATHS,
  KENYA_SVG_PATH,
  KENYA_SVG_VIEWBOX
} from './kenya-geo';

/**
 * A complete, server-rendered Kenya plate. It is the first paint of the hero
 * and the permanent visual on devices without WebGL or with reduced motion.
 * The WebGL terrain is layered over it when it is ready.
 */
export function KenyaFallback() {
  const labelledCities = KENYA_CITY_POINTS.filter((city) => city.label);

  return (
    <div className="ps-kenyaFallback" aria-hidden="true">
      <svg
        className="ps-kenyaFallback__svg"
        viewBox={KENYA_SVG_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <defs>
          <radialGradient id="ps-kenyaAura" cx="50%" cy="44%" r="58%">
            <stop offset="0%" stopColor="#e3a33b" stopOpacity="0.26" />
            <stop offset="38%" stopColor="#1f6a4f" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#061710" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ps-kenyaLand" x1="22%" y1="6%" x2="78%" y2="96%">
            <stop offset="0%" stopColor="#1b3a2c" />
            <stop offset="44%" stopColor="#3d5a3d" />
            <stop offset="72%" stopColor="#7b6742" />
            <stop offset="100%" stopColor="#3f3224" />
          </linearGradient>
          <linearGradient id="ps-kenyaRim" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#f0c77e" />
            <stop offset="52%" stopColor="#e3a33b" />
            <stop offset="100%" stopColor="#b9542f" />
          </linearGradient>
          <filter id="ps-kenyaGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ps-kenyaSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <clipPath id="ps-kenyaClip">
            <path d={KENYA_SVG_PATH} />
          </clipPath>
        </defs>

        <ellipse cx="500" cy="590" rx="440" ry="430" fill="url(#ps-kenyaAura)" />
        <g className="ps-kenyaFallback__orbits" fill="none" stroke="#f3ecdc" strokeOpacity="0.1">
          <ellipse cx="500" cy="600" rx="436" ry="208" transform="rotate(-9 500 600)" />
          <ellipse cx="500" cy="600" rx="360" ry="166" transform="rotate(-9 500 600)" />
          <ellipse cx="500" cy="600" rx="284" ry="126" transform="rotate(-9 500 600)" />
        </g>

        {/* The soft cast shadow gives the plate a physical edge. */}
        <g transform="translate(24 62)" opacity="0.55">
          <path d={KENYA_SVG_PATH} fill="#020b08" filter="url(#ps-kenyaSoft)" />
        </g>

        <g className="ps-kenyaFallback__country">
          <path
            d={KENYA_SVG_PATH}
            fill="url(#ps-kenyaLand)"
            stroke="#061710"
            strokeWidth="22"
            strokeLinejoin="round"
          />
          <path
            d={KENYA_SVG_PATH}
            fill="none"
            stroke="url(#ps-kenyaRim)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            filter="url(#ps-kenyaGlow)"
          />

          <g clipPath="url(#ps-kenyaClip)" opacity="0.42" fill="none" stroke="#f3ecdc">
            <path d="M140 330 C 360 260, 610 330, 878 268" strokeOpacity="0.16" strokeWidth="1.1" />
            <path d="M120 410 C 350 336, 640 418, 902 344" strokeOpacity="0.2" strokeWidth="1.1" />
            <path d="M116 488 C 330 430, 630 514, 910 440" strokeOpacity="0.14" strokeWidth="1.1" />
            <path d="M150 570 C 350 528, 620 608, 880 534" strokeOpacity="0.18" strokeWidth="1.1" />
            <path d="M188 650 C 380 620, 600 690, 830 626" strokeOpacity="0.13" strokeWidth="1.1" />
            <path d="M248 728 C 410 706, 560 762, 750 714" strokeOpacity="0.16" strokeWidth="1.1" />
          </g>

          {KENYA_SVG_LAKE_PATHS.map((lake) => (
            <path
              key={lake.name}
              d={lake.path}
              fill="#0a3434"
              stroke="#8fc2b0"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
          ))}

          <path
            d={KENYA_SVG_ISLAND_PATH}
            fill="#7b6742"
            stroke="url(#ps-kenyaRim)"
            strokeWidth="2"
          />
        </g>

        <g className="ps-kenyaFallback__cities">
          {labelledCities.map((city) => {
            const alignEnd = city.svg.x > 790;
            const labelX = alignEnd ? city.svg.x - 18 : city.svg.x + 16;
            return (
              <g key={city.name}>
                <circle cx={city.svg.x} cy={city.svg.y} r="22" fill="#e3a33b" opacity="0.12" />
                <circle
                  cx={city.svg.x}
                  cy={city.svg.y}
                  r={city.name === 'Nairobi' ? 7 : 5}
                  fill="#f8dfaa"
                />
                <circle cx={city.svg.x} cy={city.svg.y} r="2.4" fill="#e3a33b" />
                <path
                  d={`M${city.svg.x} ${city.svg.y - 11} v-18`}
                  stroke="#e3a33b"
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                />
                <text
                  x={labelX}
                  y={city.svg.y - 24}
                  fill="#f3ecdc"
                  fillOpacity="0.78"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontSize="18"
                  letterSpacing="3.2"
                  textAnchor={alignEnd ? 'end' : 'start'}
                >
                  {city.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        <g className="ps-kenyaFallback__grid" fill="none" stroke="#f3ecdc" strokeOpacity="0.08">
          <path d="M500 92v960M256 300v600M744 300v600" />
          <path d="M236 590h528" strokeDasharray="3 12" />
        </g>
      </svg>
    </div>
  );
}
