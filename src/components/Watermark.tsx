import { ICONS } from "./Icons";

/** Faint "Suite & Seat · flights · hotels" pattern behind every page. Decorative only. */
export function Watermark() {
  return (
    <div className="watermark" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="wm" width="440" height="280" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <g fill="currentColor" fontFamily="Inter, system-ui, sans-serif">
              <text x="24" y="64" fontSize="26" fontWeight="800" letterSpacing="3">
                SUITE &amp; SEAT
              </text>
              <text x="26" y="88" fontSize="10.5" fontWeight="600" letterSpacing="4.5">
                FLIGHTS · HOTELS · POINTS
              </text>
              <path d={ICONS.plane} transform="translate(262 34) scale(1.9) rotate(45 12 12)" />
              <path d={ICONS.bed} transform="translate(92 168) scale(1.7)" />
              <text x="190" y="210" fontSize="26" fontWeight="800" letterSpacing="3">
                SUITE &amp; SEAT
              </text>
              <text x="192" y="234" fontSize="10.5" fontWeight="600" letterSpacing="4.5">
                FLIGHTS · HOTELS · POINTS
              </text>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm)" />
      </svg>
    </div>
  );
}
