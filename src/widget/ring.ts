/**
 * Ring SVG string builder for the home-screen widget (build-plan Phase 10).
 *
 * The Android widget renders SVG via `<SvgWidget svg={svgString} />`, so we build the completion
 * ring as a plain SVG string here — the SAME geometry as the app's `ProgressRing`
 * (`src/ui/primitives/ProgressRing.tsx`): a full-circumference track circle plus a progress arc
 * drawn with `stroke-dasharray` (= circumference) and a `stroke-dashoffset` proportional to the
 * uncompleted fraction, rotated -90° so it sweeps clockwise from 12 o'clock.
 *
 * Pure string math — no react-native-svg, no hooks — so it's safe to call from the headless widget
 * task. There is NO animation in a widget (RemoteViews can't animate a stroke); the arc is drawn at
 * its final offset for the given fraction, which is the reduced-motion equivalent of the app ring.
 */

export interface RingParams {
  /** Completion fraction 0..1 (clamped). */
  value: number;
  /** Overall SVG size in px. */
  size: number;
  /** Stroke width in px. */
  strokeWidth: number;
  /** Progress arc color (hex). */
  color: string;
  /** Track (unfilled) color (hex). */
  trackColor: string;
}

/** Build the ring as a standalone SVG document string. */
export function ringSvg({ value, size, strokeWidth, color, trackColor }: RingParams): string {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  // Offset: full circumference at 0% (nothing drawn) → 0 at 100% (fully drawn). Matches ProgressRing.
  const dashOffset = circumference * (1 - clamped);

  // Round to keep the string compact and deterministic.
  const f = (n: number) => Math.round(n * 100) / 100;

  return [
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
    // Track — full circle.
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>`,
    // Progress arc — rotated -90° about the center so it starts at 12 o'clock and sweeps clockwise.
    `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"`,
    ` stroke-linecap="round" stroke-dasharray="${f(circumference)}" stroke-dashoffset="${f(dashOffset)}"`,
    ` transform="rotate(-90 ${f(cx)} ${f(cy)})"/>`,
    `</svg>`,
  ].join("");
}
