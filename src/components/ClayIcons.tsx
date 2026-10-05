import React from 'react';

interface ClayIconProps {
  className?: string;
  size?: number;
}

export const ClayTruck: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      {/* Truck Body Gradient */}
      <linearGradient id="truckBody" x1="10" y1="14" x2="54" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="0.6" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      {/* Truck Cargo Box Gradient */}
      <linearGradient id="cargoBox" x1="8" y1="12" x2="40" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" />
        <stop offset="0.7" stopColor="#E2E8F0" />
        <stop offset="1" stopColor="#CBD5E1" />
      </linearGradient>
      {/* Cabin Gradient */}
      <linearGradient id="cabinGrad" x1="36" y1="18" x2="56" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.7" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
      {/* Windshield Gradient */}
      <linearGradient id="windshield" x1="42" y1="20" x2="52" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#BAE6FD" />
        <stop offset="1" stopColor="#38BDF8" />
      </linearGradient>
      {/* Wheel Rubber Gradient */}
      <radialGradient id="wheelRubber" cx="50%" cy="50%" r="50%">
        <stop stopColor="#475569" />
        <stop offset="0.8" stopColor="#1E293B" />
        <stop offset="1" stopColor="#0F172A" />
      </radialGradient>
      {/* Wheel Rim Gradient */}
      <linearGradient id="wheelRim" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#E2E8F0" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
      {/* Clay Highlight Soft Shadow Filter */}
      <filter id="clayHighlight" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="54" rx="24" ry="4" fill="#091E42" fillOpacity="0.3" />

    {/* Cargo Container (Rounded Puffy Clay Box) */}
    <rect x="8" y="14" width="32" height="28" rx="7" fill="url(#cargoBox)" />
    {/* Inner top highlight for 3D bevel */}
    <path d="M12 16H36C38 16 39 17 39 19V20C39 18 38 17 36 17H12C10 17 9 18 9 20V19C9 17 10 16 12 16Z" fill="#FFFFFF" fillOpacity="0.8" />
    {/* Cargo Container Stripes */}
    <rect x="15" y="20" width="4" height="16" rx="2" fill="#94A3B8" fillOpacity="0.5" />
    <rect x="22" y="20" width="4" height="16" rx="2" fill="#94A3B8" fillOpacity="0.5" />
    <rect x="29" y="20" width="4" height="16" rx="2" fill="#94A3B8" fillOpacity="0.5" />

    {/* Cabin Front (Clay Round Shape) */}
    <path d="M38 22C38 18 40 16 44 16H47C51 16 54 19 55 24L56 34C56 38 53 42 49 42H38V22Z" fill="url(#cabinGrad)" />
    {/* Windshield */}
    <path d="M41 20H47C49 20 51 21 52 23L53 28H41V20Z" rx="2" fill="url(#windshield)" />
    {/* Headlight */}
    <circle cx="54" cy="36" r="2.5" fill="#FDE047" />

    {/* Wheels (Clay Inset) */}
    {/* Rear Wheel 1 */}
    <circle cx="16" cy="46" r="6" fill="url(#wheelRubber)" />
    <circle cx="16" cy="46" r="3" fill="url(#wheelRim)" />
    {/* Rear Wheel 2 */}
    <circle cx="30" cy="46" r="6" fill="url(#wheelRubber)" />
    <circle cx="30" cy="46" r="3" fill="url(#wheelRim)" />
    {/* Front Wheel */}
    <circle cx="48" cy="46" r="6" fill="url(#wheelRubber)" />
    <circle cx="48" cy="46" r="3" fill="url(#wheelRim)" />
  </svg>
);

export const ClayWarehouse: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="whRoof" x1="12" y1="12" x2="52" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.6" stopColor="#D97706" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="whWall" x1="12" y1="24" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="0.7" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="whDoor" x1="24" y1="36" x2="40" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
    </defs>

    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="54" rx="24" ry="4" fill="#091E42" fillOpacity="0.3" />

    {/* Main Wall */}
    <rect x="12" y="24" width="40" height="28" rx="6" fill="url(#whWall)" />
    {/* Wall Highlight */}
    <path d="M16 26H48C50 26 51 27 51 28C51 27 50 26 48 26H16C14 26 13 27 13 28C13 27 14 26 16 26Z" fill="#FFFFFF" fillOpacity="0.5" />

    {/* Triangular Roof (Curved Clay Style) */}
    <path d="M10 26C10 24 11 23 13 22L30 11C31 10 33 10 34 11L51 22C53 23 54 24 54 26C54 27 53 28 51 28H13C11 28 10 27 10 26Z" fill="url(#whRoof)" />
    <path d="M13 24L31 12C32 11 32 11 33 12L51 24" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

    {/* Shutter Door (Industrial Rolling Door) */}
    <rect x="23" y="34" width="18" height="18" rx="4" fill="url(#whDoor)" />
    <line x1="23" y1="38" x2="41" y2="38" stroke="#64748B" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="23" y1="42" x2="41" y2="42" stroke="#64748B" strokeWidth="1.5" strokeOpacity="0.4" />
    <line x1="23" y1="46" x2="41" y2="46" stroke="#64748B" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* Windows */}
    <rect x="15" y="32" width="5" height="5" rx="1.5" fill="#E0F2FE" />
    <rect x="44" y="32" width="5" height="5" rx="1.5" fill="#E0F2FE" />
  </svg>
);

export const ClayStorefront: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="dcBuilding" x1="12" y1="20" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="0.7" stopColor="#0284C7" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
      <linearGradient id="awningRed" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#F87171" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
      <linearGradient id="awningWhite" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>

    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="54" rx="24" ry="4" fill="#091E42" fillOpacity="0.3" />

    {/* Building Body */}
    <rect x="14" y="24" width="36" height="28" rx="6" fill="url(#dcBuilding)" />

    {/* Striped Clay Awning (Like the Bakery in reference image!) */}
    {/* Stripe 1: Red */}
    <path d="M12 18H18V26C18 27.5 16.5 28.5 15 28.5C13.5 28.5 12 27.5 12 26V18Z" fill="url(#awningRed)" />
    {/* Stripe 2: White */}
    <path d="M18 18H25V26C25 27.5 23.5 28.5 22 28.5C20.5 28.5 18 27.5 18 26V18Z" fill="url(#awningWhite)" />
    {/* Stripe 3: Red */}
    <path d="M25 18H32V26C32 27.5 30.5 28.5 29 28.5C27.5 28.5 25 27.5 25 26V18Z" fill="url(#awningRed)" />
    {/* Stripe 4: White */}
    <path d="M32 18H39V26C39 27.5 37.5 28.5 36 28.5C34.5 28.5 32 27.5 32 26V18Z" fill="url(#awningWhite)" />
    {/* Stripe 5: Red */}
    <path d="M39 18H46V26C46 27.5 44.5 28.5 43 28.5C41.5 28.5 39 27.5 39 26V18Z" fill="url(#awningRed)" />
    {/* Stripe 6: White */}
    <path d="M46 18H52V26C52 27.5 50.5 28.5 49 28.5C47.5 28.5 46 27.5 46 26V18Z" fill="url(#awningWhite)" />

    {/* Awning Highlight */}
    <path d="M12 18H52" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />

    {/* Store Glass Window */}
    <rect x="18" y="32" width="13" height="14" rx="3" fill="#E0F2FE" />
    <path d="M20 34L28 42" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />

    {/* Store Glass Door */}
    <rect x="35" y="32" width="11" height="20" rx="3" fill="#BAE6FD" />
    <circle cx="38" cy="42" r="1.5" fill="#0284C7" />
  </svg>
);

export const ClayKurmaPackage: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="packPouch" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="0.5" stopColor="#D97706" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="packGold" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="dateDate" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#78350F" />
        <stop offset="1" stopColor="#451A03" />
      </linearGradient>
    </defs>

    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="4" fill="#091E42" fillOpacity="0.3" />

    {/* Packaging Pouch Body */}
    <rect x="14" y="14" width="36" height="38" rx="8" fill="url(#packPouch)" />
    {/* Top Seal / Ziplock Ribs */}
    <rect x="14" y="14" width="36" height="7" rx="3" fill="#B45309" />
    <line x1="18" y1="18" x2="46" y2="18" stroke="#FEF3C7" strokeWidth="1" strokeOpacity="0.7" />

    {/* Gold Center Label (Embossed Clay) */}
    <rect x="20" y="25" width="24" height="20" rx="4" fill="url(#packGold)" />
    {/* Inner Date Silhouette */}
    <ellipse cx="32" cy="34" rx="6" ry="4.5" transform="rotate(-15 32 34)" fill="url(#dateDate)" />
    <path d="M30 32C32 33 34 33 35 32" stroke="#FDE68A" strokeWidth="0.8" strokeLinecap="round" />

    {/* Top Highlight on Pouch */}
    <path d="M18 16H46" stroke="#FEF3C7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
  </svg>
);

export const ClayTarget: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <radialGradient id="targetRed" cx="40%" cy="35%" r="60%">
        <stop stopColor="#F87171" />
        <stop offset="0.6" stopColor="#EF4444" />
        <stop offset="1" stopColor="#B91C1C" />
      </radialGradient>
      <radialGradient id="targetWhite" cx="40%" cy="35%" r="60%">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.8" stopColor="#F1F5F9" />
        <stop offset="1" stopColor="#CBD5E1" />
      </radialGradient>
      <radialGradient id="targetCenter" cx="40%" cy="35%" r="60%">
        <stop stopColor="#FBBF24" />
        <stop offset="0.7" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </radialGradient>
    </defs>
    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="56" rx="20" ry="4" fill="#091E42" fillOpacity="0.25" />
    {/* Outer Red Ring */}
    <circle cx="32" cy="30" r="24" fill="url(#targetRed)" />
    <ellipse cx="26" cy="18" rx="8" ry="4" fill="#FFFFFF" fillOpacity="0.35" />
    {/* White Ring */}
    <circle cx="32" cy="30" r="17" fill="url(#targetWhite)" />
    {/* Middle Red Ring */}
    <circle cx="32" cy="30" r="11" fill="url(#targetRed)" />
    {/* Center Gold Bullseye */}
    <circle cx="32" cy="30" r="5" fill="url(#targetCenter)" />
    <circle cx="30" cy="28" r="1.5" fill="#FEF3C7" />
  </svg>
);

export const ClayDocument: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="docBody" x1="16" y1="8" x2="48" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="0.7" stopColor="#F8FAFC" />
        <stop offset="1" stopColor="#E2E8F0" />
      </linearGradient>
      <linearGradient id="docFold" x1="38" y1="8" x2="48" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#CBD5E1" />
        <stop offset="1" stopColor="#94A3B8" />
      </linearGradient>
      <linearGradient id="docSeal" x1="32" y1="36" x2="46" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="56" rx="20" ry="4" fill="#091E42" fillOpacity="0.25" />
    {/* Paper Sheet */}
    <path d="M16 12C16 9.79 17.79 8 20 8H38L48 18V50C48 52.21 46.21 54 44 54H20C17.79 54 16 52.21 16 50V12Z" fill="url(#docBody)" />
    {/* Fold corner */}
    <path d="M38 8V16C38 17.1 38.9 18 40 18H48L38 8Z" fill="url(#docFold)" />
    {/* Highlight */}
    <path d="M20 10H36" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Text Lines */}
    <rect x="22" y="22" width="16" height="3" rx="1.5" fill="#3B82F6" fillOpacity="0.8" />
    <rect x="22" y="28" width="20" height="2.5" rx="1.25" fill="#94A3B8" fillOpacity="0.6" />
    <rect x="22" y="34" width="14" height="2.5" rx="1.25" fill="#94A3B8" fillOpacity="0.6" />
    <rect x="22" y="40" width="18" height="2.5" rx="1.25" fill="#94A3B8" fillOpacity="0.6" />
    {/* Stamp / Seal */}
    <circle cx="40" cy="42" r="5" fill="url(#docSeal)" />
    <path d="M38 42L39.5 43.5L42.5 40.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ClayBox: React.FC<ClayIconProps> = ({ className = '', size = 52 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-md select-none shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="boxTop" x1="16" y1="12" x2="48" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="boxLeft" x1="12" y1="24" x2="32" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#D97706" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
      <linearGradient id="boxRight" x1="32" y1="24" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#B45309" />
        <stop offset="1" stopColor="#92400E" />
      </linearGradient>
      <linearGradient id="tapeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#FEF3C7" />
        <stop offset="1" stopColor="#FCD34D" />
      </linearGradient>
    </defs>
    {/* Ground Soft Shadow */}
    <ellipse cx="32" cy="55" rx="22" ry="4" fill="#091E42" fillOpacity="0.3" />
    {/* Left Face */}
    <path d="M14 26L32 35V52L14 43V26Z" fill="url(#boxLeft)" />
    {/* Right Face */}
    <path d="M32 35L50 26V43L32 52V35Z" fill="url(#boxRight)" />
    {/* Top Face */}
    <path d="M32 17L50 26L32 35L14 26L32 17Z" fill="url(#boxTop)" />
    {/* Packaging Tape Top */}
    <path d="M26 20L44 29L38 32L20 23L26 20Z" fill="url(#tapeGrad)" fillOpacity="0.8" />
    {/* Tape Front Down */}
    <path d="M30 34H34V46H30V34Z" fill="url(#tapeGrad)" fillOpacity="0.8" />
  </svg>
);
