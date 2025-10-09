export type ColorString = `#${string}` | `rgb(${string})` | `rgba(${string})` | `hsl(${string})` | `hsla(${string})`;

export interface ParticleStyle {
  color?: ColorString;
  radius?: number;
}

export interface ConstraintStyle {
  color?: ColorString;
  lineWidth?: number;
  radius?: number;
}

export interface IConstraint {
  type: string;
  relax(stepCoef: number): void;
  draw?(ctx: CanvasRenderingContext2D): void;
}
