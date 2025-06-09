// Function to convert hex color to RGB
export const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex.slice(1), 16);
  return [(bigint >> 16) & 0xff, (bigint >> 8) & 0xff, bigint & 0xff];
};

// Function to convert RGB back to hex
export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

/**
 * Linearly interpolate between two colors.
 * @param color1 - Starting hex color.
 * @param color2 - Ending hex color.
 * @param factor - Interpolation factor (0 to 1).
 * @returns Interpolated hex color.
 */
export const interpolateColor = (
  color1: string,
  color2: string,
  factor: number,
): string => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return rgbToHex(r, g, b);
};

/**
 * Get a color for a specific point in the scale.
 * @param point - A number between 1 and 5.
 * @param colors - Array of base hex colors.
 * @returns Hex color string.
 */
export const getColor = (point: number, colors: string[]): string => {
  if (point < 1 || point > 5) throw new Error('Point must be between 1 and 5');

  const index = Math.floor(point) - 1; // Determine the base color index
  const factor = point - Math.floor(point); // Fraction between two colors

  return index >= colors.length - 1
    ? colors[colors.length - 1]
    : interpolateColor(colors[index], colors[index + 1], factor);
};

/**
 * Generate a color vector with a fixed number of steps.
 * @param steps - Total number of steps.
 * @param colors - Array of base hex colors.
 * @returns Array of hex colors.
 */
export const generateColorVector = (
  steps: number,
  colors: string[],
): string[] => {
  const range = 5; // From 1 to 5
  return Array.from({ length: steps }, (_, i) =>
    getColor(1 + (range - 1) * (i / (steps - 1)), colors),
  );
};
