import type { PropertyCategoryId } from '@/domain/types';

const GLYPH_PATHS: Record<PropertyCategoryId, React.ReactNode> = {
  houses: (
    <>
      <path d="M5 27V14.5L16 5l11 9.5V27" />
      <path d="M5 27h22" />
      <path d="M12 27v-7.5h8V27" />
      <path d="M16 5v4" />
    </>
  ),
  shops: (
    <>
      <path d="M4 12h24v15H4z" />
      <path d="M4 12 7 5h18l3 7" />
      <path d="M10 12v4a3 3 0 0 0 6 0v-4M16 12v4a3 3 0 0 0 6 0v-4" />
      <path d="M4 12h24" />
      <path d="M12 27v-6h8v6" />
    </>
  ),
  offices: (
    <>
      <path d="M6 27V6h20v21" />
      <path d="M3 27h26" />
      <path d="M12 11h2M18 11h2M12 16h2M18 16h2M12 21h2M18 21h2" />
      <path d="M6 6h20" />
    </>
  ),
  'event-halls': (
    <>
      <path d="M5 27V12a11 11 0 0 1 22 0v15" />
      <path d="M5 27h22" />
      <path d="M12 27v-7a4 4 0 0 1 8 0v7" />
      <path d="M9 7.5 7 5M23 7.5 25 5M16 4V1" />
    </>
  ),
  'mixed-use-building': (
    <>
      <path d="M5 27V9l11-5 11 5v18" />
      <path d="M3 27h26" />
      <path d="M10 13h3M19 13h3M10 18h3M19 18h3M13 27v-5h6v5" />
    </>
  )
};

export function CategoryGlyph({
  category,
  className
}: {
  category: PropertyCategoryId;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPH_PATHS[category]}
    </svg>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="13" height="13" fill="currentColor" />
      <rect x="18" y="1" width="13" height="13" stroke="currentColor" strokeWidth="1.6" />
      <rect x="1" y="18" width="13" height="13" stroke="currentColor" strokeWidth="1.6" />
      <rect x="18" y="18" width="13" height="13" fill="var(--ps-ochre, #e3a33b)" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 10h15" />
      <path d="m11 4 6 6-6 6" />
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10 18s6-5.2 6-10A6 6 0 0 0 4 8c0 4.8 6 10 6 10Z" />
      <circle cx="10" cy="8" r="2.2" />
    </svg>
  );
}

export function KenyaContours({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="M-80 690c160-120 246-256 380-268 150-13 206 96 330 58 120-37 152-186 278-209 118-21 196 62 264 130 72 71 168 100 348 42" />
        <path d="M-80 650c158-116 256-236 384-247 143-12 195 92 316 57 128-37 160-181 285-203 118-21 190 60 257 126 74 73 174 101 350 51" />
        <path d="M-70 610c150-110 262-216 386-226 136-11 183 88 301 55 130-36 169-176 293-197 112-19 181 58 249 122 74 71 173 99 343 60" />
        <path d="M-60 570c142-104 266-196 388-205 129-10 172 84 286 52 132-35 178-171 301-191 105-17 172 56 240 118 74 69 172 96 336 68" />
        <path d="M-50 530c134-98 268-176 390-184 121-8 161 80 271 49 135-35 186-166 309-185 98-16 163 54 231 114 74 67 171 93 329 75" />
        <path d="M-40 490c126-92 268-156 392-163 113-7 150 76 256 46 137-34 194-161 317-179 91-14 154 52 222 110 74 64 170 89 322 82" />
        <path d="M-30 450c118-86 268-136 394-142 105-5 139 72 241 43 139-35 202-156 325-173 83-13 145 50 213 106 73 62 169 85 316 88" />
        <path d="M-20 410c110-80 268-116 396-121 97-3 128 68 226 40 141-34 210-151 333-167 76-12 136 48 204 102 73 59 168 81 309 95" />
      </g>
    </svg>
  );
}
