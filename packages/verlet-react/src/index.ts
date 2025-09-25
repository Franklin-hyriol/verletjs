/**
 * Entry point for the verlet-react library.
 */

// Main hook for managing the simulation
export { useVerlet } from './hooks/useVerlet';

// Main component for rendering the simulation
export { VerletCanvas } from './components/VerletCanvas/VerletCanvas';

// Context and hook for advanced usage and creating custom components
export { VerletContext } from './context/VerletContext';
export { useVerletContext } from './hooks/useVerletContext';

// Components
export { Point } from './components/Point/Point';
export { LineSegments } from './components/LineSegments/LineSegments';
export { Cloth } from './components/Cloth/Cloth';
export { Tire } from './components/Tire/Tire';